import {test,expect} from '@playwright/test';

test('account entry is accessible, explains storage, and preserves guest progress',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('claudelab.v2',JSON.stringify({courses:{cowork:{completed:{welcome:true}}},notes:{private:{a:'Local reflection'}}})));
 await page.goto('/#/account');
 await expect(page.locator('#googleSignIn')).toBeVisible();
 await expect(page.locator('#accountBtn')).toHaveAccessibleName('Sign in to save progress');
 await expect(page.locator('#content')).toContainText('until you choose to import');
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')));
 expect(s.courses.cowork.completed.welcome).toBe(true);expect(s.notes.private.a).toBe('Local reflection');
 await page.goto('/#/admin');await expect(page.locator('#content')).toContainText('Sign in with the course owner');
});

test('a cached account workspace is hidden until that account is verified',async({page})=>{
 await page.addInitScript(()=>{
  localStorage.setItem('claudelab.accountOwner','prior-account');
  localStorage.setItem('claudelab.v2',JSON.stringify({courses:{cowork:{completed:{steering:true}}},notes:{private:{a:'Prior learner private note'}}}));
  localStorage.setItem('claudelab.guest',JSON.stringify({courses:{cowork:{completed:{welcome:true}}}}));
 });
 await page.goto('/#/account');await expect(page.locator('#googleSignIn')).toBeVisible();
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')));
 expect(s.courses.cowork.completed.steering).toBeUndefined();expect(s.notes?.private).toBeUndefined();
 expect(s.courses.cowork.completed.welcome).toBe(true);
});

test('account and admin screens fit 320px in both themes',async({page})=>{
 await page.setViewportSize({width:320,height:800});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const theme of ['light','dark']){
  await page.addInitScript(t=>localStorage.setItem('claudelab.v2',JSON.stringify({theme:t,courses:{}})),theme);
  for(const route of ['account','admin']){
   await page.goto('/#/'+route);
   await expect(page.locator('#content h1')).toBeVisible();
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
 }
 expect(errors).toEqual([]);
});

test('Google sign-in uses a clean redirect and a PKCE challenge',async({page})=>{
 let authorize;
 await page.route('**/auth/v1/authorize?**',async route=>{authorize=new URL(route.request().url());await route.fulfill({status:200,body:'OAuth redirect verified'});});
 await page.goto('/#/account');await page.locator('#googleSignIn').click();
 await expect.poll(()=>!!authorize).toBe(true);
 expect(authorize.searchParams.get('provider')).toBe('google');
 expect(authorize.searchParams.get('redirect_to')).toBe('http://127.0.0.1:4173/');
 expect(authorize.searchParams.get('code_challenge_method')).toBe('s256');
 expect(authorize.searchParams.get('code_challenge').length).toBeGreaterThan(20);
 expect(authorize.searchParams.get('scopes')).toBe('openid email profile');
});

test('a provider error returns to account with safe feedback and preserves guest work',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('claudelab.v2',JSON.stringify({courses:{cowork:{completed:{welcome:true}}},notes:{private:{a:'Keep this reflection'}}})));
 await page.goto('/?error=server_error&error_code=unexpected_failure&error_description=provider-private-detail#error=server_error&error_description=provider-private-detail');
 await expect(page.locator('#authFeedback')).toContainText('Google sign-in could not finish');
 await expect(page).toHaveURL('http://127.0.0.1:4173/#/account');
 await expect(page.locator('#googleSignIn')).toBeEnabled();
 await expect(page.locator('#content')).not.toContainText('provider-private-detail');
 const s=await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')));
 expect(s.courses.cowork.completed.welcome).toBe(true);expect(s.notes.private.a).toBe('Keep this reflection');
});

test('cancelled Google sign-in is explained without rendering provider details',async({page})=>{
 await page.goto('/#error=access_denied&error_description=provider-private-detail');
 await expect(page.locator('#authFeedback')).toContainText('Google sign-in was cancelled');
 await expect(page).toHaveURL('http://127.0.0.1:4173/#/account');
});

test('a failed PKCE exchange removes the code and offers a retry',async({page})=>{
 await page.route('**/auth/v1/token?**',r=>r.fulfill({status:400,contentType:'application/json',body:JSON.stringify({error:'invalid_grant',error_description:'expired-code-private-detail'})}));
 await page.goto('/?code=disposable-expired-code');
 await expect(page.locator('#authFeedback')).toContainText('Sign-in could not finish');
 await expect(page).toHaveURL('http://127.0.0.1:4173/#/account');
 await expect(page.locator('#googleSignIn')).toBeEnabled();
 await expect(page.locator('#content')).not.toContainText('expired-code-private-detail');
});


test('guest reminders offer Google and GitHub while email/password forms are absent',async({page})=>{
 for(const route of ['','me','cowork/welcome']){
  await page.goto('/#/'+route);await expect(page.locator('.guest-prompt')).toBeVisible();
  await expect(page.locator('.guest-prompt')).toContainText('only in this browser');
  await expect(page.locator('.guest-prompt')).toContainText('sign in with GitHub');
 }
 await page.locator('.guest-prompt a').last().click();
 await expect(page.locator('#googleSignIn')).toBeVisible();await expect(page.locator('#githubSignIn')).toBeVisible();
 await expect(page.locator('#content input,#emailOptions,#emailAuthForm')).toHaveCount(0);
});

test('GitHub sign-in uses PKCE, a clean redirect, and email scope without repository permissions',async({page})=>{
 let authorize;
 await page.route('**/auth/v1/settings',r=>r.fulfill({json:{external:{google:true,github:true}}}));
 await page.route('**/auth/v1/authorize?**',r=>{authorize=new URL(r.request().url());return r.fulfill({status:200,body:'GitHub OAuth redirect verified'});});
 await page.goto('/#/account');await page.locator('#githubSignIn').click();
 await expect.poll(()=>!!authorize).toBe(true);
 expect(authorize.searchParams.get('provider')).toBe('github');expect(authorize.searchParams.get('scopes')).toBe('user:email');
 expect(authorize.searchParams.get('redirect_to')).toBe('http://127.0.0.1:4173/');
 expect(authorize.searchParams.get('code_challenge_method')).toBe('s256');expect(authorize.searchParams.get('code_challenge').length).toBeGreaterThan(20);
});

test('unconfigured GitHub sign-in offers Google and preserves guest progress',async({page})=>{
 await page.route('**/auth/v1/settings',r=>r.fulfill({json:{external:{google:true,github:false}}}));
 await page.addInitScript(()=>localStorage.setItem('claudelab.v2',JSON.stringify({courses:{cowork:{completed:{welcome:true}}}})));
 await page.goto('/#/account');await page.locator('#githubSignIn').click();
 await expect(page.locator('#authFeedback')).toContainText('Continue with Google');
 await expect(page.locator('#googleSignIn')).toBeEnabled();await expect(page.locator('#githubSignIn')).toBeEnabled();
 await expect(page).toHaveURL('http://127.0.0.1:4173/#/account');
 expect(await page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')).courses.cowork.completed.welcome)).toBe(true);
});

test('GitHub cancellation names the correct provider without exposing provider details',async({page})=>{
 await page.addInitScript(()=>sessionStorage.setItem('claudelab.authSource','github'));
 await page.goto('/?error=access_denied&error_description=private-github-detail');
 await expect(page.locator('#authFeedback')).toContainText('GitHub sign-in was cancelled');
 await expect(page.locator('#content')).not.toContainText('private-github-detail');
 await expect(page).toHaveURL('http://127.0.0.1:4173/#/account');
});

test('GitHub callback verifies the account, offers guest import, and removes reminders',async({page})=>{
 const email='learner@example.org';
 const user={id:'00000000-0000-4000-8000-000000000001',aud:'authenticated',role:'authenticated',email,email_confirmed_at:new Date().toISOString(),app_metadata:{provider:'github'},user_metadata:{user_name:'learner'}};
 const exp=Math.floor(Date.now()/1000)+3600;
 const access_token=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:user.id,exp,aud:'authenticated',role:'authenticated'})).toString('base64url'),'test-signature'].join('.');
 const session={user,access_token,refresh_token:'test-refresh-token',expires_in:3600,expires_at:exp,token_type:'bearer'};
 await page.addInitScript(()=>{
  localStorage.setItem('claudelab.v2',JSON.stringify({courses:{cowork:{completed:{welcome:true}}}}));
  localStorage.setItem('sb-sbzrhwxpavjogwdnavkh-auth-token-code-verifier',JSON.stringify('test-verifier'));
  sessionStorage.setItem('claudelab.authSource','github');
 });
 await page.route('**/auth/v1/token?grant_type=pkce',r=>r.fulfill({json:session}));
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 await page.route('**/rest/v1/learner_state?**',r=>r.fulfill({json:{state:{courses:{}},revision:0}}));
 await page.goto('/?code=test-github-callback');
 await expect(page.locator('#accountStatus')).toContainText('Progress synced');await expect(page.locator('#importGuest')).toBeVisible();
 await expect(page).toHaveURL('http://127.0.0.1:4173/#/account');
 await page.goto('/#/me');await expect(page.locator('.guest-prompt')).toHaveCount(0);
});

test('an unconfigured preview explains guest access instead of hanging',async({page})=>{
 await page.route('**/assets/js/cloud-config.js?**',r=>r.fulfill({contentType:'application/javascript',body:'window.CLAUDELAB_CLOUD = {};'}));
 await page.goto('/#/account');await expect(page.locator('#content')).toContainText('Accounts are unavailable in this preview');
 await expect(page.locator('#googleSignIn,#githubSignIn')).toHaveCount(0);
});

test('account route aliases remain usable',async({page})=>{
 for(const hash of ['#account','#/account/','#/account?source=progress']){
  await page.goto('/'+hash);await expect(page.locator('#googleSignIn')).toBeVisible();await expect(page.locator('#githubSignIn')).toBeVisible();
 }
});

test('background sync preserves lesson content and scrolling when server reorders fields',async({page})=>{
 const email='learner@example.org';
 const user={id:'00000000-0000-4000-8000-000000000001',aud:'authenticated',role:'authenticated',email,email_confirmed_at:new Date().toISOString(),app_metadata:{provider:'github'},user_metadata:{user_name:'learner'}};
 const exp=Math.floor(Date.now()/1000)+3600;
 const access_token=[Buffer.from(JSON.stringify({alg:'HS256',typ:'JWT'})).toString('base64url'),Buffer.from(JSON.stringify({sub:user.id,exp,aud:'authenticated',role:'authenticated'})).toString('base64url'),'test-signature'].join('.');
 const session={user,access_token,refresh_token:'test-refresh-token',expires_in:3600,expires_at:exp,token_type:'bearer'};
 await page.addInitScript(()=>{
  localStorage.setItem('claudelab.v2',JSON.stringify({courses:{cowork:{completed:{welcome:true}}}}));
  localStorage.setItem('sb-sbzrhwxpavjogwdnavkh-auth-token-code-verifier',JSON.stringify('test-verifier'));
  sessionStorage.setItem('claudelab.authSource','github');
 });
 await page.route('**/auth/v1/token?grant_type=pkce',r=>r.fulfill({json:session}));
 await page.route('**/auth/v1/user',r=>r.fulfill({json:user}));
 let remote={state:{courses:{}},revision:0},saves=0;
 function reordered(value){if(Array.isArray(value))return value.map(reordered);if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).reverse().map(k=>[k,reordered(value[k])]));return value;}
 await page.route('**/rest/v1/learner_state?**',r=>r.fulfill({json:remote}));
 await page.route('**/rest/v1/rpc/save_learning_state',r=>{
  saves++;remote={state:reordered(r.request().postDataJSON().body),revision:remote.revision+1};return r.fulfill({json:remote});
 });
 await page.route('**/rest/v1/learning_events**',r=>r.fulfill({status:201,json:[]}));
 await page.goto('/?code=test-github-callback');
 await expect(page.locator('#accountStatus')).toContainText('Progress synced');
 await page.goto('/#/cowork/welcome?path=gtm');
 await expect(page.locator('.lesson-top')).toBeVisible();
 await page.evaluate(()=>{window.stableLesson=document.querySelector('.lesson-top');window.scrollTo(0,600);});
 await expect.poll(()=>saves).toBeGreaterThan(0);
 await page.waitForTimeout(1800);
 expect(await page.evaluate(()=>window.stableLesson===document.querySelector('.lesson-top'))).toBe(true);
 expect(await page.evaluate(()=>window.scrollY)).toBeGreaterThan(400);
 const saved=saves;
 await page.evaluate(()=>window.ACCOUNT.sync());
 expect(await page.evaluate(()=>window.stableLesson===document.querySelector('.lesson-top'))).toBe(true);
 expect(await page.evaluate(()=>window.scrollY)).toBeGreaterThan(400);
 expect(saves).toBe(saved);
});
