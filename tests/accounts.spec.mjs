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
