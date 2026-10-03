import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import {adminFixture,guestFixture} from './fixtures/admin-report.mjs';
async function setup(page, handler){
 const user={id:'00000000-0000-4000-8000-000000000001',aud:'authenticated',role:'authenticated',email:'owner@example.invalid',email_confirmed_at:new Date().toISOString(),app_metadata:{provider:'google'},user_metadata:{full_name:'Owner'}};
 const exp=Math.floor(Date.now()/1000)+3600;
 const access_token=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:user.id,exp,aud:'authenticated',role:'authenticated'})).toString('base64url'),'disposable-test-signature'].join('.');
 await page.addInitScript(session=>localStorage.setItem('sb-sbzrhwxpavjogwdnavkh-auth-token',JSON.stringify(session)),{user,access_token,refresh_token:'disposable-test-refresh',expires_in:3600,expires_at:exp,token_type:'bearer'});
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await page.route('**/rest/v1/learner_state?**',r=>r.fulfill({json:{state:{courses:{}},revision:0}}));
 await page.route('**/rest/v1/rpc/learning_admin_dashboard',async r=>handler?handler(r):r.fulfill({json:adminFixture(r.request().postDataJSON())}));
 await page.route('https://claude-lab-usage.vercel.app/api/report?**',r=>r.fulfill({json:guestFixture()}));
 await page.goto('/#/admin');
}
test('owner dashboard shows data, filters scope, pagination, and accessible daily values',async({page})=>{
 const requests=[];await setup(page,r=>{const p=r.request().postDataJSON();requests.push(p);return r.fulfill({json:adminFixture(p)});});
 await expect(page.locator('.admin-private')).toHaveText('Owner access verified');
 await expect(page.locator('.admin-stat').first()).toContainText('248');
 await expect(page.locator('#adminLearners')).toContainText('Showing 1–25 of 28');
 await expect(page.locator('#adminLearners img')).toHaveCount(0);
 await expect(page.locator('#adminGuest')).toContainText('Partial report');
 await page.locator('#adminNext').click();await expect(page.locator('#adminLearners')).toContainText('Showing 26–28 of 28');await expect(page.locator('#adminNext')).toBeDisabled();
 await page.locator('#adminDays').selectOption('7');await page.locator('#adminCourse').selectOption('cowork');await page.getByRole('button',{name:'Apply filters'}).click();
 await expect(page.locator('#adminFeedback')).toContainText('updated');expect(requests.at(-1).p_days).toBe(7);expect(requests.at(-1).p_offset).toBe(0);expect(requests.at(-1).p_course).toBe('cowork');
 await page.locator('#adminSearch').fill('learner27@');await page.locator('#adminDirectory button').click();
 await expect(page.locator('#adminLearners')).toContainText('Showing 1–1 of 1');await expect(page.locator('#adminLearners')).toContainText('learner27@example.invalid');
 await expect(page.locator('.admin-stat').first()).toContainText('248');
 await page.locator('.admin-details summary').first().click();await expect(page.getByRole('region',{name:'Daily learner activity'})).toBeVisible();
 await page.getByRole('link',{name:'Lessons',exact:true}).click();await expect(page).toHaveURL(/#\/admin$/);
 expect(await page.evaluate(()=>document.activeElement.id)).toBe('adminLessons');
});
test('admin exports include the filtered records and protect spreadsheet formulas',async({page})=>{
 await setup(page);await expect(page.locator('#learnersCsv')).toBeVisible();
 const downloading=page.waitForEvent('download');await page.locator('#learnersCsv').click();const dl=await downloading;
 const csv=await fs.readFile(await dl.path(),'utf8');expect(csv).toContain("'=HYPERLINK");expect(csv).toContain('28 of 28 matching learners');expect(csv).toContain('learner27@example.invalid');
 const reporting=page.waitForEvent('download');await page.locator('#adminReport').click();const report=await fs.readFile(await(await reporting).path(),'utf8');expect(report).toContain('# Claude Lab administrator report');expect(report).not.toContain('@example.invalid');
});
test('an update failure keeps the previous period and permits retry',async({page})=>{
 let fail=false;await setup(page,r=>fail?r.fulfill({status:503,json:{code:'temporarily_unavailable'}}):r.fulfill({json:adminFixture(r.request().postDataJSON())}));
 await expect(page.locator('#adminDays')).toHaveValue('30');fail=true;await page.locator('#adminDays').selectOption('7');await page.getByRole('button',{name:'Apply filters'}).click();
 await expect(page.locator('#adminFeedback')).toContainText('last successful report');await expect(page.locator('#adminDays')).toHaveValue('30');await expect(page.locator('#refreshAdmin')).toBeEnabled();
 fail=false;await page.locator('#refreshAdmin').click();await expect(page.locator('#adminFeedback')).toContainText('Dashboard updated');
});
test('owner permission revocation clears the private report',async({page})=>{
 let deny=false;await setup(page,r=>deny?r.fulfill({status:403,json:{code:'42501'}}):r.fulfill({json:adminFixture()}));
 await expect(page.locator('#learnersCsv')).toBeVisible();deny=true;await page.locator('#refreshAdmin').click();await expect(page.locator('#content')).toContainText('requires the course owner');await expect(page.locator('#adminLearners')).toHaveCount(0);await expect(page.locator('#content')).not.toContainText('learner0@example.invalid');
});
test('a late private response cannot overwrite another page',async({page})=>{
 let release;const gate=new Promise(r=>release=r);await setup(page,async r=>{await gate;await r.fulfill({json:adminFixture()});});
 await page.locator('#accountBtn').click();await expect(page.locator('#content h1')).toContainText('Pick up');release();await page.waitForTimeout(200);await expect(page.locator('#adminLearners')).toHaveCount(0);await expect(page.locator('#content')).not.toContainText('learner0@example.invalid');
});
test('empty reports and missing visitor storage are useful and contain no invalid values',async({page})=>{
 await page.route('https://claude-lab-usage.vercel.app/api/report?**',r=>r.fulfill({status:503,body:'Unavailable'}));
 await setup(page,r=>{const d=adminFixture();Object.keys(d.summary).forEach(k=>d.summary[k]=0);d.directory={total:0,offset:0,limit:25,rows:[],statuses:{}};d.providers=[];d.cohorts=[];d.lessons=[];d.courses=[];d.activation={accounts:0,opened_lesson:0,opened_and_completed:0};d.daily.forEach(r=>{r.active_learners=0;r.lesson_views=0;r.active_seconds=0;r.new_accounts=0;});return r.fulfill({json:d});});
 // Override the fixture's guest handler with a failure for this check.
 await page.unroute('https://claude-lab-usage.vercel.app/api/report?**');await page.route('https://claude-lab-usage.vercel.app/api/report?**',r=>r.fulfill({status:503,body:'Unavailable'}));
 await expect(page.locator('#adminLearners')).toContainText('No learners match');await expect(page.locator('#adminLessons')).toContainText('No lesson activity');
 await page.locator('#refreshAdmin').click();await expect(page.locator('#adminGuest')).toContainText('temporarily unavailable');await expect(page.locator('#content')).not.toContainText('NaN');await expect(page.locator('#content')).not.toContainText('Infinity');
});
test('owner dashboard fits 320px in both themes and keeps controls keyboard accessible',async({page})=>{
 await page.setViewportSize({width:320,height:800});const errors=[];page.on('pageerror',e=>errors.push(e.message));await setup(page);
 for(const theme of ['light','dark']){
  if(theme==='dark')await page.locator('#themeBtn').click();await expect(page.locator('#adminGuest')).toContainText('Guest browser IDs');
  const overflow=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,items:Array.from(document.querySelectorAll('.admin-page *')).filter(el=>el.getBoundingClientRect().right>innerWidth+1&&el.getBoundingClientRect().width>0).slice(0,8).map(el=>({tag:el.tagName,class:el.className,width:el.getBoundingClientRect().width,right:el.getBoundingClientRect().right}))}));expect(overflow.scroll,JSON.stringify(overflow)).toBeLessThanOrEqual(overflow.width+1);
  await expect(page.locator('#adminDays')).toHaveAccessibleName('Period');await expect(page.locator('#adminSearch')).toHaveAccessibleName('Find a learner');
  await page.locator('#adminSearch').focus();await page.keyboard.type('no match');await page.keyboard.press('Enter');await expect(page.locator('#adminLearners')).toContainText('0 matching learners');
  await page.locator('#adminSearch').fill('');await page.keyboard.press('Enter');await expect(page.locator('#adminLearners')).toContainText('Showing 1–25');
 }
 expect(errors).toEqual([]);await page.setViewportSize({width:1440,height:1050});await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:'/tmp/claude-lab-admin-fixture.png'});
});

test('owner route aliases load the dashboard',async({page})=>{
 await setup(page);
 for(const hash of ['#admin','#/admin/','#/admin?source=account']){await page.goto('/'+hash);await expect(page.locator('.admin-private')).toHaveText('Owner access verified');}
});
