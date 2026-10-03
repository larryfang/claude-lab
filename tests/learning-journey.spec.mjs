import {test,expect} from '@playwright/test';
test.use({reducedMotion:'reduce'});

test('a planned session has a finish point and resumes its remaining lessons after reload',async({page})=>{
 await page.goto('/#/');
 await page.locator('#sessionRecommendation .btn-primary').click();
 await expect(page.locator('.session-context')).toContainText('lesson 1 of 2');
 await expect(page.locator('.path-step-count')).toHaveText('Step 1 of 8');
 await page.locator('#completeBtn').click();
 await expect(page.locator('article.lesson h1')).toBeFocused();
 await expect(page.locator('#completeBtn')).toContainText('Finish this session');
 await page.reload();
 await expect(page.locator('.session-context')).toContainText('lesson 2 of 2');
 await page.goto('/#/');
 await page.locator('.resume-card').click();
 await expect(page).toHaveURL(/what-is-cowork\?path=essentials&session=/);
 await page.locator('#completeBtn').click();
 await expect(page).toHaveURL(/cowork\/session\?path=essentials&session=/);
 await expect(page.locator('.session-summary')).toContainText('2 of 2 lessons complete');
 await expect(page.locator('.session-summary h1')).toBeFocused();
 await page.getByRole('link',{name:/Plan your next session/}).click();
 await expect(page.locator('#learningGoal')).toBeFocused();
 await expect(page.locator('#sessionRecommendation')).toContainText('Lab: Setup');
});

test('looking up a reference keeps the current session and offers a way back',async({page})=>{
 await page.goto('/#/cowork/welcome?path=gtm&session=welcome%2Cwhat-is-cowork');
 await expect(page.locator('#completeBtn')).toBeVisible();
 await page.goto('/#/cowork/glossary');
 await page.getByRole('link',{name:/Back to your learning/}).click();
 await expect(page).toHaveURL(/welcome\?path=gtm&session=welcome%2Cwhat-is-cowork$/);
 await page.goto('/#/cowork/brief-library');
 await page.goto('/#/');
 await expect(page.locator('.resume-card')).toHaveAttribute('href','#/cowork/welcome?path=gtm&session=welcome%2Cwhat-is-cowork');
});

test('keyboard navigation stays within a planned session',async({page})=>{
 await page.goto('/#/cowork/welcome?path=gtm&session=welcome%2Cwhat-is-cowork');
 await expect(page.locator('#completeBtn')).toBeVisible();
 await page.keyboard.press('ArrowRight');
 await expect(page).toHaveURL(/what-is-cowork\?path=gtm&session=/);
 await expect(page.locator('#completeBtn')).toBeVisible();
 await page.keyboard.press('ArrowRight');
 await expect(page).toHaveURL(/what-is-cowork\?path=gtm&session=/);
 await page.keyboard.press('ArrowLeft');
 await expect(page).toHaveURL(/welcome\?path=gtm&session=/);
});

test('an unfinished session overview resumes rather than claiming completion',async({page})=>{
 await page.goto('/#/cowork/session?path=essentials&session=welcome%2Cwhat-is-cowork');
 await expect(page.locator('.session-summary')).toContainText('0 of 2 lessons complete');
 await expect(page.getByRole('link',{name:/Plan your next session/})).toHaveCount(0);
 await page.getByRole('link',{name:/Continue this session/}).click();
 await expect(page).toHaveURL(/welcome\?path=essentials&session=/);
});

test('invalid session links fall back safely and cannot render injected content',async({page})=>{
 await page.goto('/#/cowork/session?path=essentials&session=welcome%2Cwelcome');
 await expect(page).toHaveURL(/cowork\/path\/essentials$/);
 await page.goto('/#/cowork/welcome?path=essentials&session=welcome%2Ccc-what');
 await expect(page.locator('article.lesson h1')).toBeVisible();
 await expect(page.locator('.session-context')).toHaveCount(0);
 await expect(page.locator('.pager .next')).toHaveAttribute('href','#/cowork/what-is-cowork?path=essentials');
});

test('session finish points fit small phones in both themes',async({page})=>{
 await page.setViewportSize({width:320,height:844});
 await page.goto('/#/');
 for(const theme of ['light','dark']){
  await page.evaluate(theme=>localStorage.setItem('claudelab.v2',JSON.stringify({theme,courses:{cowork:{completed:{welcome:true,'what-is-cowork':true}}}})),theme);
  await page.reload();
  await page.goto('/#/cowork/session?path=essentials&session=welcome%2Cwhat-is-cowork');
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  await expect(page.locator('.session-summary h1')).toBeVisible();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
  await expect(page.getByRole('link',{name:/Plan your next session/})).toBeVisible();
 }
});

test('home and course resume actions keep the learner in their chosen session',async({page})=>{
 const href='#/cowork/what-is-cowork?path=gtm&session=welcome%2Cwhat-is-cowork';
 await page.goto('/'+href);
 await expect(page.locator('article.lesson h1')).toBeVisible();
 await page.goto('/#/');
 await expect(page.locator('[data-resume-primary]')).toHaveAttribute('href',href);
 await expect(page.locator('.course-card').filter({hasText:'Claude Cowork'})).toHaveAttribute('href',href);
 await page.goto('/#/cowork');
 await expect(page.locator('.hero-cta .btn-primary')).toHaveAttribute('href',href);
 await page.locator('.hero-cta .btn-primary').click();
 await expect(page.locator('.session-context')).toContainText('lesson 2 of 2');
});

test('phone outline links keep session context and focus the selected section',async({page})=>{
 await page.setViewportSize({width:320,height:844});
 const href='#/cowork/what-is-cowork?path=essentials&session=welcome%2Cwhat-is-cowork';
 await page.goto('/'+href);
 const outline=page.locator('.lesson-outline');
 await outline.locator('summary').click();
 const link=outline.locator('.toc a').first();
 await expect(link).toHaveAttribute('href',href);
 const id=await link.getAttribute('data-target');
 await link.click();
 await expect(page.locator('#'+id)).toBeFocused();
 await expect(page).toHaveURL(new RegExp('session=welcome%2Cwhat-is-cowork$'));
 await expect(outline).not.toHaveAttribute('open','');
});

test('a malformed saved session does not break the home page',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('claudelab.v2',JSON.stringify({courses:{},last:{c:'cowork',l:'welcome',p:'essentials',s:'welcome,welcome'}})));
 await page.goto('/#/');
 await expect(page.locator('[data-resume-primary]')).toHaveAttribute('href','#/cowork/welcome?path=essentials');
});

test('finishing a whole route shows its progress and a focused next step',async({page})=>{
 await page.goto('/#/cowork/path/essentials');
 const ids=await page.evaluate(()=>window.COURSES[0].fastPaths.find(path=>path.id==='essentials').lessons);
 await page.evaluate(ids=>localStorage.setItem('claudelab.v2',JSON.stringify({courses:{cowork:{completed:Object.fromEntries(ids.slice(0,-1).map(id=>[id,true]))}}})),ids);
 await page.reload();
 await page.goto('/#/cowork/'+ids.at(-1)+'?path=essentials');
 await page.locator('#completeBtn').click();
 await expect(page).toHaveURL(/cowork\/path\/essentials$/);
 await expect(page.locator('.route-progress')).toContainText(ids.length+' of '+ids.length+' lessons complete');
 await expect(page.locator('.session-takeaway')).toContainText('Route finished');
 await expect(page.locator('#content h1')).toBeFocused();
});

test('finishing the course returns to a clear completion page rather than entering references',async({page})=>{
 await page.goto('/#/claude-code');
 const ids=await page.evaluate(()=>window.COURSES.find(course=>course.id==='claude-code').modules.filter(module=>!/reference/i.test(module.id)).flatMap(module=>module.lessons.map(lesson=>lesson.id)));
 await page.evaluate(ids=>localStorage.setItem('claudelab.v2',JSON.stringify({courses:{'claude-code':{completed:Object.fromEntries(ids.slice(0,-1).map(id=>[id,true]))}}})),ids);
 await page.reload();
 await page.goto('/#/claude-code/'+ids.at(-1));
 await page.locator('#completeBtn').click();
 await expect(page).toHaveURL(/#\/claude-code$/);
 await expect(page.locator('.session-takeaway')).toContainText('Course finished');
 await expect(page.locator('#content h1')).toBeFocused();
});

test('navigation announces completion only for lessons that are actually complete',async({page})=>{
 await page.goto('/#/cowork/welcome');
 const welcome=page.locator('.nav-link[data-lesson="welcome"]');
 await expect(welcome).toHaveAccessibleName('Welcome: Hire Your AI Teammate 6 minutes');
 expect((await welcome.boundingBox()).height).toBeLessThan(65);
 await page.locator('#completeBtn').click();
 await expect(page.locator('article.lesson h1')).toHaveText('Cowork in Eight Minutes');
 await expect(welcome).toHaveAccessibleName('Welcome: Hire Your AI Teammate Completed 6 minutes');
 expect((await welcome.boundingBox()).height).toBeLessThan(65);
 await expect(page.locator('.nav-link[data-lesson="what-is-cowork"]')).toHaveAccessibleName('Cowork in Eight Minutes 8 minutes');
 await welcome.click();
 await page.locator('#completeBtn').click();
 await expect(welcome).toHaveAccessibleName('Welcome: Hire Your AI Teammate 6 minutes');
});
