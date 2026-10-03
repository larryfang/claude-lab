/* Opt-in live integration checks. Creates disposable users, then removes them.
   Management credentials are passed only through the process environment. No traces. */
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {randomUUID} from 'node:crypto';
import {createClient} from '@supabase/supabase-js';
import {chromium} from '@playwright/test';
const token=process.env.SUPABASE_ACCESS_TOKEN;
if(!token)throw Error('Set SUPABASE_ACCESS_TOKEN privately to run live account checks.');
const ctx={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../assets/js/cloud-config.js',import.meta.url),'utf8'),ctx);
const config=ctx.window.CLAUDELAB_CLOUD,ref=new URL(config.url).hostname.split('.')[0];
const settingsResponse=await fetch(config.url+'/auth/v1/settings',{headers:{apikey:config.publishableKey}});
if(!settingsResponse.ok)throw Error('Could not verify the account test provider configuration.');
const settings=await settingsResponse.json();
if(!settings.external?.email)throw Error('Password-based disposable account checks require a separate test project with Email enabled. Production allows Google/GitHub only; do not enable Email just to run this check.');
const host=process.env.COURSE_TEST_URL||'http://127.0.0.1:4173/';
async function management(path,body){
 const r=await fetch('https://api.supabase.com/v1/projects/'+ref+path,{method:body?'POST':'GET',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
 if(!r.ok)throw Error('Management request failed ('+r.status+')');return r.json();
}
const sql=query=>management('/database/query',{query});
const keys=await management('/api-keys');
const service=keys.find(k=>k.name==='service_role').api_key;
const privileged=createClient(config.url,service,{auth:{persistSession:false,autoRefreshToken:false}});
const client=()=>createClient(config.url,config.publishableKey,{auth:{persistSession:false,autoRefreshToken:false}});
const users=[],contexts=[];let browser;
const emailPrefix='claude-lab-test-'+randomUUID();
let allowlisted=null;
let checks=0;
function ok(label){console.log('PASS '+label);checks++;}
async function createLearner(n){
 const email=emailPrefix+'-'+n+'@example.invalid',password=randomUUID()+'Aa1!';
 const r=await privileged.auth.admin.createUser({email,password,email_confirm:true,user_metadata:{full_name:'Disposable learner '+n,admin:true}});
 assert.equal(r.error,null,'Disposable user creation');users.push(r.data.user.id);
 const c=client(),signed=await c.auth.signInWithPassword({email,password});assert.equal(signed.error,null,'Disposable login');
 return {id:r.data.user.id,email,client:c,session:signed.data.session};
}
async function save(c,state,rev){const r=await c.rpc('save_learning_state',{expected_revision:rev,body:state});assert.equal(r.error,null,'Save progress');return r.data;}
async function state(c){const r=await c.from('learner_state').select('state,revision').maybeSingle();assert.equal(r.error,null);return r.data;}
async function open(learner,guest,staleGuest){
 const context=await browser.newContext();contexts.push(context);
 await context.addInitScript(({session,ref,guest,staleGuest})=>{
  if(localStorage.getItem('claudelab.test.seeded'))return;
  localStorage.setItem('claudelab.test.seeded','1');
  if(session)localStorage.setItem('sb-'+ref+'-auth-token',JSON.stringify(session));
  localStorage.setItem('claudelab.usage.allow','1');
  if(guest)localStorage.setItem('claudelab.v2',JSON.stringify(guest));
  if(staleGuest)localStorage.setItem('claudelab.guest',JSON.stringify({courses:{}}));
 },{session:learner?.session,ref,guest,staleGuest});
 const page=await context.newPage();await page.goto(host+'#/account');
 if(learner)await page.waitForSelector('#syncNow');else await page.waitForSelector('#googleSignIn');
 return {context,page};
}
async function sync(page){await page.waitForFunction(()=>window.ACCOUNT.isSignedIn());await page.evaluate(()=>{window.__accountCheckComplete=false;window.__accountCheckSync=window.ACCOUNT.sync().finally(()=>{window.__accountCheckComplete=true;});});await page.waitForFunction(()=>window.__accountCheckComplete,{},{timeout:20000});}
async function lesson(page,id){await page.evaluate(id=>{location.hash='#/cowork/'+id;},id);await page.waitForFunction(id=>JSON.parse(localStorage.getItem('claudelab.v2')).last?.l===id,id);await page.waitForSelector('#completeBtn');}
async function stored(page){return page.evaluate(()=>JSON.parse(localStorage.getItem('claudelab.v2')));}
async function until(fn,label){for(let i=0;i<40;i++){if(await fn())return;await new Promise(r=>setTimeout(r,200));}throw Error(label);}
try{
 const a=await createLearner(1),b=await createLearner(2);const anon=client();
 const initial={courses:{cowork:{completed:{welcome:true}}},last:{c:'cowork',l:'welcome',p:'essentials',s:'welcome,what-is-cowork'}};
 let saved=await save(a.client,initial,0);
 assert.equal(saved.revision,1);assert.deepEqual((await state(a.client)).state,initial);ok('authenticated state and revision round-trip');
 const hidden=await b.client.from('learner_state').select('*').eq('user_id',a.id);assert.equal(hidden.error,null);assert.deepEqual(hidden.data,[]);
 const hijack=await b.client.from('learner_state').insert({user_id:a.id,state:{}});assert.ok(hijack.error);
 const reassignment=await a.client.from('learner_state').update({user_id:b.id}).eq('user_id',a.id);assert.ok(reassignment.error);
 const privateProfiles=await b.client.from('learner_profiles').select('*').eq('user_id',a.id);assert.deepEqual(privateProfiles.data,[]);
 const anonymous=await anon.from('learner_state').select('*');assert.ok(anonymous.error);
 ok('anonymous access and cross-account read/write/reassignment denied');
 const stale=await a.client.rpc('save_learning_state',{expected_revision:0,body:initial}).retry(false);assert.equal(stale.error.code,'PT409');
 const secret=await a.client.rpc('save_learning_state',{expected_revision:1,body:{notes:{secret:'private'}}});assert.ok(secret.error);
 ok('stale revisions and notebook uploads rejected');
 const ev={id:randomUUID(),session_id:randomUUID(),type:'quiz',course:'cowork',lesson:'welcome',correct:true};
 assert.equal((await a.client.rpc('record_learning_events',{batch:[ev]})).data,1);
 assert.equal((await a.client.rpc('record_learning_events',{batch:[ev]})).data,0);
 const spoof=await b.client.rpc('record_learning_events',{batch:[{...ev,user_id:a.id}]});assert.ok(spoof.error);
 const timestamp=await a.client.from('learning_events').insert({user_id:a.id,id:randomUUID(),session_id:randomUUID(),type:'view',occurred_at:'2020-01-01'});assert.ok(timestamp.error);
 const otherEvents=await b.client.from('learning_events').select('*').eq('user_id',a.id);assert.deepEqual(otherEvents.data,[]);
 const daily=await a.client.from('learning_daily').select('*').eq('lesson','welcome');assert.equal(daily.data[0].quiz_attempts,1);
 const badDaily=await a.client.from('learning_daily').update({quiz_correct:100}).eq('user_id',a.id);assert.ok(badDaily.error);
 ok('events use verified identity, deduplicate and aggregate once; totals cannot be forged');
 const denied=await a.client.rpc('learning_admin_report');assert.ok(denied.error,'Editable metadata must not grant admin');
 const anonAdmin=await anon.rpc('learning_admin_report');assert.ok(anonAdmin.error);
 allowlisted=a.email;await sql("insert into private.course_admin_emails(email) values('"+a.email+"')");
 const report=await a.client.rpc('learning_admin_report');assert.equal(report.error,null);assert.ok(report.data.learners.some(u=>u.user_id===a.id));
 ok('owner allowlist authorizes report; guest and editable admin metadata do not');
 // Completed quick-start routes must not be labelled abandoned after inactivity.
 const paths=await a.client.from('path_catalog').select('lessons').eq('course','cowork').eq('path','essentials').single();
 const completed=Object.fromEntries(paths.data.lessons.map(id=>[id,true]));
 saved=await save(a.client,{courses:{cowork:{completed}},last:{c:'cowork',l:'verify',p:'essentials'}},saved.revision);
 await sql("update public.learning_daily set last_seen=now()-interval '8 days' where user_id='"+a.id+"'");
 const completeReport=await a.client.rpc('learning_admin_report');const row=completeReport.data.learners.find(u=>u.user_id===a.id);
 assert.equal(row.learning_status,'completed');assert.equal(row.likely_dropoff,false);
 completed.welcome=false;saved=await save(a.client,{courses:{cowork:{completed}},last:{c:'cowork',l:'welcome',p:'essentials'}},saved.revision);
 const pausedReport=await a.client.rpc('learning_admin_report');assert.equal(pausedReport.data.learners.find(u=>u.user_id===a.id).learning_status,'paused');
 ok('selected-route completion and inactivity classification');
 saved=await save(a.client,{courses:{}},saved.revision);
 browser=await chromium.launch();
 const one=await open(a,{courses:{cowork:{completed:{'lab-setup':true}}},notes:{guest:{a:'Guest private note'}}});
 assert.ok(await one.page.locator('#importGuest').isVisible());assert.equal((await stored(one.page)).notes.guest,undefined);
 await one.page.locator('#importGuest').click();await sync(one.page);
 assert.equal((await state(a.client)).state.courses.cowork.completed['lab-setup'],true);
 assert.equal((await state(a.client)).state.notes,undefined);
 ok('explicit guest import preserves local notebook privacy');
 const two=await open(a);
 await lesson(one.page,'welcome');await one.page.locator('#completeBtn').click();
 await lesson(two.page,'what-is-cowork');await two.page.locator('#completeBtn').click();
 await Promise.all([sync(one.page),sync(two.page)]);
 await until(async()=>{const s=(await state(a.client)).state;return s.courses.cowork.completed.welcome&&s.courses.cowork.completed['what-is-cowork'];},'Device merge did not persist');
 await two.page.goto(host+'#/account');await sync(two.page);
 assert.equal((await stored(two.page)).courses.cowork.completed.welcome,true);
 ok('concurrent browser devices merge completions and pull remote changes');
 await lesson(two.page,'steering');await two.context.setOffline(true);await two.page.locator('#completeBtn').click();await sync(two.page);
 assert.equal((await stored(two.page)).courses.cowork.completed.steering,true);
 await two.context.setOffline(false);await two.page.evaluate(()=>window.dispatchEvent(new Event('online')));
 await until(async()=>!!(await state(a.client)).state.courses.cowork.completed.steering,'Offline progress did not recover');
 ok('offline learning survives and syncs when connection returns');
 await lesson(two.page,'welcome');await two.page.locator('#completeBtn').click();await sync(two.page);
 assert.ok(!(await state(a.client)).state.courses.cowork.completed.welcome);
 ok('explicit completion undo syncs');
 await one.page.evaluate(()=>location.hash='#/admin');await one.page.waitForSelector('.admin-stats');if(process.env.COURSE_TEST_SCREENSHOT)await one.page.screenshot({path:process.env.COURSE_TEST_SCREENSHOT,fullPage:true});assert.ok(await one.page.locator('text=Disposable learner 2').isVisible());
 const extra=await privileged.from('learning_events').insert(Array.from({length:1100},()=>({user_id:a.id,id:randomUUID(),session_id:randomUUID(),type:'heartbeat'})));assert.equal(extra.error,null,'Export pagination seed');
 const [download]=await Promise.all([one.page.waitForEvent('download'),one.page.evaluate(()=>location.hash='#/account').then(()=>one.page.locator('#accountExport').click())]);
 const exported=JSON.parse(fs.readFileSync(await download.path(),'utf8'));assert.ok(exported.daily_totals.length);assert.ok(exported.events.length>1000,'Export must paginate beyond the server row cap');assert.equal(exported.progress.notes,undefined);
 ok('owner dashboard and private learning export');
 await one.page.locator('#accountSignOut').click();await one.page.waitForSelector('#googleSignIn');
 assert.equal((await stored(one.page)).notes.guest.a,'Guest private note');assert.equal((await stored(one.page)).courses.cowork?.completed?.steering,undefined);
 const other=await open(b);assert.equal((await stored(other.page)).courses.cowork?.completed?.steering,undefined);
 await other.page.evaluate(()=>location.hash='#/admin');await until(async()=> (await other.page.locator('#content').innerText()).includes('requires the course owner'),'Unauthorized dashboard missing');
 ok('sign-out restores guest workspace; another account cannot see prior progress or analytics');
 for(const staleGuest of [false,true]){
  // Each case needs its own session because sign-out revokes that session.
  const fresh=await createLearner(staleGuest?'stale-guest':'first-guest');
  const untouchedGuest=await open(fresh,{courses:{cowork:{completed:{welcome:true}}},notes:{original:{a:'Unimported guest reflection'}}},staleGuest);
  await untouchedGuest.page.locator('#accountSignOut').click();await untouchedGuest.page.waitForSelector('#googleSignIn');
  const restoredGuest=await stored(untouchedGuest.page);
  assert.equal(restoredGuest.courses.cowork.completed.welcome,true,'Unimported guest completion must survive first login, including an older guest cache');
  assert.equal(restoredGuest.notes.original.a,'Unimported guest reflection');
 }
 ok('first login preserves existing guest progress and notes without requiring import');
 // All temporary identities and their cascaded records are removed in finally.
 console.log('Verified '+checks+' live account checks.');
}finally{
 for(const context of contexts)await context.close();if(browser)await browser.close();
 if(allowlisted)await sql("delete from private.course_admin_emails where email='"+allowlisted+"'");
 for(const id of users){const r=await privileged.auth.admin.deleteUser(id);if(r.error)throw Error('Disposable user cleanup failed');}
 console.log('Disposable users and their learning records removed.');
}
