import {test,expect} from '@playwright/test';
async function seed(page,state){await page.addInitScript(s=>localStorage.setItem('claudelab.v2',JSON.stringify(s)),state);}
const card={f:'<strong>What is a good brief?</strong>',b:'A result you can check.',c:'cowork',l:'the-brief',box:1};
async function signInWithLocalProfile(page,remote){
 const user={id:'00000000-0000-4000-8000-000000000001',aud:'authenticated',role:'authenticated',email:'learner@example.org'};
 const exp=Math.floor(Date.now()/1000)+3600;
 const access_token=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:user.id,exp,aud:'authenticated',role:'authenticated'})).toString('base64url'),'test-signature'].join('.');
 await page.addInitScript(({user,exp,access_token,state})=>{
  localStorage.setItem('sb-sbzrhwxpavjogwdnavkh-auth-token',JSON.stringify({user,access_token,refresh_token:'test-refresh-token',expires_in:3600,expires_at:exp,token_type:'bearer'}));
  localStorage.setItem('claudelab.account.'+user.id,JSON.stringify({state:{...state,name:'Learner Name',notes:{one:{a:'Private notebook'}}},base:state,revision:1}));
 },{user,exp,access_token,state:remote.state});
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
}

test('review cards expose their question and answer to assistive technology',async({page})=>{
 await seed(page,{courses:{},cards:{one:card}});await page.goto('/#/review');
 await expect(page.locator('.flash-card')).toHaveAccessibleName(/What is a good brief/);
 await page.locator('.flash-card').click();await expect(page.locator('.flash-card')).toHaveAccessibleName(/A result you can check/);
 await page.locator('.flash-card').click();await expect(page.locator('.flash-grades')).toBeHidden();
});

test('imported review cards cannot execute markup or unsafe links',async({page})=>{
 await seed(page,{courses:{},cards:{one:{...card,f:'<img src=x onerror="window.cardInjected=true"><a href="javascript:window.cardInjected=true">Question</a>',b:'<svg onload="window.cardInjected=true"></svg><em>Safe answer</em>'}}});
 await page.goto('/#/review');await expect(page.locator('.flash-card')).toBeVisible();
 await page.waitForTimeout(100);
 expect(await page.evaluate(()=>window.cardInjected===true)).toBe(false);
 await expect(page.locator('.flash-text img,.flash-text svg')).toHaveCount(0);
 expect(await page.locator('.flash-text a').getAttribute('href')).not.toMatch(/^javascript:/);
 await expect(page.locator('.flash-back em')).toHaveText('Safe answer');
});

test('saved review dates cannot execute markup in the empty-deck message',async({page})=>{
 await seed(page,{courses:{},cards:{one:{...card,due:'zz<img src=x onerror="window.cardInjected=true">'}}});
 await page.goto('/#/review');await page.waitForTimeout(100);
 expect(await page.evaluate(()=>window.cardInjected===true)).toBe(false);
 await expect(page.locator('#content img')).toHaveCount(0);
});

test('older review cards without a box count as first-box cards and award finite XP',async({page})=>{
 const {box,...oldCard}=card;await seed(page,{courses:{},cards:{one:oldCard}});
 await page.goto('/#/me');await expect(page.locator('.stat-xp .stat-num')).toHaveText('2');
 await expect(page.locator('.weak-item')).toContainText('Still in box 1');
 await page.goto('/#/review');await expect(page.locator('.box-col').first().locator('b')).toHaveText('1');
});

test('reflections survive immediate navigation and reload',async({page})=>{
 await page.goto('/#/cowork/lab-first-run');await page.locator('.reflect textarea').first().fill('Keep this new reflection.');
 await page.goto('/#/notebook');await expect(page.locator('.note-a')).toContainText('Keep this new reflection.');
});

test('resetting progress preserves notebook and personal preferences',async({page})=>{
 await seed(page,{courses:{cowork:{completed:{welcome:true}}},notes:{one:{q:'My note',a:'Do not delete my reflection.',c:'cowork',l:'welcome',t:Date.now()}},name:'Learner',focus:true,theme:'dark'});
 await page.goto('/#/me');page.on('dialog',d=>d.accept());await page.locator('#resetBtn').click();
 await page.goto('/#/notebook');await expect(page.locator('.note-a')).toHaveText('Do not delete my reflection.');
 const reset=await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')));
 expect(reset.name).toBe('Learner');expect(reset.focus).toBe(true);expect(reset.theme).toBe('dark');
 expect(reset.courses.cowork?.completed?.welcome).toBeUndefined();
});

test('legacy progress migrates into the current Cowork track',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('claudelab.v1',JSON.stringify({completed:{welcome:true},checks:{'welcome:one':true}})));
 await page.goto('/#/cowork/welcome');await expect(page.locator('#completeBtn')).toHaveClass(/done/);
});

test('a malformed progress file is rejected without overwriting good work',async({page})=>{
 await seed(page,{courses:{cowork:{completed:{welcome:true}}}});await page.goto('/#/me');
 await page.locator('#progressImport').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({courses:{cowork:42},cards:{bad:null}}))});
 await expect(page.locator('#toast')).toContainText('Import failed');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')).courses.cowork.completed.welcome)).toBe(true);
 await page.goto('/#/cowork/welcome');await expect(page.locator('#completeBtn')).toHaveClass(/done/);
});

test('prototype keys in a progress file are rejected before changing state',async({page})=>{
 await seed(page,{courses:{cowork:{completed:{welcome:true}}}});await page.goto('/#/me');
 await page.locator('#progressImport').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('{"courses":{"cowork":{"completed":{"welcome":true}}},"__proto__":{"polluted":true}}')});
 await expect(page.locator('#toast')).toContainText('Import failed');
 expect(await page.evaluate(()=>Object.prototype.polluted)).toBeUndefined();
 expect(await page.evaluate(()=>Object.hasOwn(JSON.parse(localStorage.getItem('claudelab.v2')),'__proto__'))).toBe(false);
});

test('a failed lesson can be retried after connectivity returns',async({page})=>{
 let offline=true;
 await page.route('**/content/00-welcome.md',r=>offline?r.abort('failed'):r.continue());
 await page.goto('/#/cowork/welcome?path=gtm');await expect(page.locator('.error-box')).toBeVisible();
 offline=false;await page.getByRole('button',{name:'Try again',exact:true}).click();
 await expect(page.locator('#completeBtn')).toBeVisible();await expect(page).toHaveURL(/welcome\?path=gtm$/);
});

test('full-text search retries documents that failed on the first attempt',async({page})=>{
 let online=false;
 await page.route('**/content/*.md',r=>!online?r.abort('failed'):r.request().url().endsWith('/00-welcome.md')?r.fulfill({body:'# Welcome\n\n## Recovered\nslow recovery marker',contentType:'text/plain'}):r.continue());
 await page.goto('/#/');await page.locator('#searchBtn').click();await page.locator('#searchInput').fill('slow recovery marker');
 await expect(page.locator('#searchResults')).not.toContainText('Searching lesson text…');
 await page.keyboard.press('Escape');online=true;
 await page.locator('#searchBtn').click();await page.locator('#searchInput').fill('slow recovery marker');
 await expect(page.locator('.sr-snippet')).toContainText('slow recovery marker');
});

test('an ordering move keeps keyboard focus on the same item at a boundary',async({page})=>{
 await page.goto('/#/claude-code/cc-epcc');const first=page.locator('.order').first().locator('.order-item').first();
 const key=await first.getAttribute('data-key');await first.locator('.order-down').click();
 const item=page.locator(".order").first().locator(`.order-item[data-key="${key}"]`);await item.locator('.order-up').focus();await page.keyboard.press('Enter');
 await expect(item.locator('.order-down')).toBeFocused();
});

test('resetting a simulation cancels the response already in progress',async({page})=>{
 await page.goto('/#/claude-code/cc-first');const sim=page.locator('.ccsim').first();
 const first=await sim.locator('[data-input]').getAttribute('placeholder');
 await sim.locator('[data-run]').click();await sim.locator('.ccsim-reset').click();
 await page.waitForTimeout(1900);
 await expect(sim.locator('[data-input]')).toHaveAttribute('placeholder',first);
 await expect(sim.locator('.ccsim-line')).toHaveCount(0);
});

test('failed clipboard APIs explain manual copy instead of claiming success',async({page})=>{
 await page.addInitScript(()=>{Object.defineProperty(navigator,'clipboard',{value:{writeText:()=>Promise.reject(Error('blocked'))}});document.execCommand=()=>false;});
 await page.goto('/#/cowork/lab-first-run');await page.locator('[data-copy]:visible').first().click();
 await expect(page.locator('#toast')).toContainText('Copy action');
 expect(await page.evaluate(()=>String(window.getSelection()).length)).toBeGreaterThan(20);
 await expect(page.locator('[data-copy]:visible').first()).not.toHaveText('Copied!');
});

test('keyboard search identifies the selected result for assistive technology',async({page})=>{
 await page.goto('/#/');await page.locator('#searchBtn').click();await page.keyboard.press('ArrowDown');
 const active=await page.locator('#searchInput').getAttribute('aria-activedescendant');expect(active).toBeTruthy();
 await expect(page.locator('#'+active)).toHaveAttribute('aria-selected','true');
 await expect(page.locator('#'+active+' .sr-title')).toHaveText(await page.locator('#searchResults a').nth(1).locator('.sr-title').innerText());
 await page.locator('#searchInput').fill('this phrase has no matching lessons 74932');
 await expect(page.locator('#searchResults a')).toHaveCount(0);
 await expect(page.locator('#searchInput')).not.toHaveAttribute('aria-activedescendant',/search-option-/);
});

test('background search indexing preserves a result selected with the keyboard',async({page})=>{
 let release;const pending=new Promise(resolve=>release=resolve);
 await page.route('**/content/*.md',async r=>{await pending;await r.continue();});
 await page.goto('/#/');await page.locator('#searchBtn').click();await page.keyboard.press('ArrowDown');
 const selected=await page.locator('#searchResults a.sel').getAttribute('href');
 release();await expect(page.locator('.sr-loading')).toHaveCount(0);
 await expect(page.locator('#searchResults a.sel')).toHaveAttribute('href',selected);
});

test('a slow progress import cannot replace the workspace after leaving the import page',async({page})=>{
 await seed(page,{courses:{cowork:{completed:{welcome:true}}}});
 await page.addInitScript(()=>{File.prototype.text=function(){return new Promise(resolve=>window.finishImport=()=>resolve('{"courses":{}}'));};});
 await page.goto('/#/me');await page.locator('#progressImport').setInputFiles({name:'backup.json',mimeType:'application/json',buffer:Buffer.from('{"courses":{}}')});
 await expect.poll(()=>page.evaluate(()=>typeof window.finishImport)).toBe('function');
 await page.getByRole('link',{name:'All courses',exact:true}).first().click();
 await page.evaluate(()=>window.finishImport());
 await expect(page.locator('.hub-hero')).toBeVisible();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')).courses.cowork.completed.welcome)).toBe(true);
});

test('pulling another device’s progress keeps the local certificate name and notebook',async({page})=>{
 let remote={state:{courses:{cowork:{completed:{welcome:true}}}},revision:1};
 await signInWithLocalProfile(page,remote);
 await page.route('**/rest/v1/learner_state?**',r=>r.fulfill({json:remote}));
 await page.goto('/#/account');await expect(page.locator('#accountStatus')).toHaveText('Progress synced');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')).name)).toBe('Learner Name');
 remote={state:{courses:{cowork:{completed:{welcome:true,steering:true}}}},revision:2};
 await page.locator('#syncNow').click();
 await expect.poll(()=>page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')).courses.cowork.completed.steering)).toBe(true);
 const local=await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')));
 expect(local.name).toBe('Learner Name');expect(local.notes.one.a).toBe('Private notebook');
});

test('malformed cloud progress never copies an account notebook into the guest workspace',async({page})=>{
 const remote={state:{courses:{}},revision:1};await signInWithLocalProfile(page,remote);
 await page.route('**/rest/v1/learner_state?**',r=>r.fulfill({json:{state:{courses:{cowork:42}},revision:2}}));
 await page.goto('/#/account');await expect(page.locator('#syncNow')).toBeVisible();
 const guest=await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.guest')));
 expect(guest.notes?.one).toBeUndefined();
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')).notes.one.a)).toBe('Private notebook');
});

test('a malformed old guest cache cannot break account startup',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('claudelab.accountOwner','prior-account');
  localStorage.setItem('claudelab.v2',JSON.stringify({courses:{}}));
  localStorage.setItem('claudelab.guest',JSON.stringify({courses:{cowork:42}}));
 });
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/#/account');await expect(page.locator('#googleSignIn')).toBeVisible();
 expect(errors).toEqual([]);
});

test('false and obsolete progress entries do not inflate totals or XP',async({page})=>{
 await seed(page,{courses:{cowork:{completed:{welcome:false,old_removed_lesson:true},checks:{'welcome:old':false},ex:{'welcome:old':false}}}});await page.goto('/#/me');
 await expect(page.locator('.stat-xp .stat-num')).toHaveText('0');
 await expect(page.locator('.stat').filter({hasText:'lessons complete'}).locator('.stat-num')).toHaveText('0');
 await expect(page.locator('.stat').filter({hasText:'exercises solved'}).locator('.stat-num')).toHaveText('0');
});
