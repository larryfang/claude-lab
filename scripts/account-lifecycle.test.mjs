import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {randomUUID} from 'node:crypto';
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const plain=v=>JSON.parse(JSON.stringify(v));
async function harness(options={}){
 const storage=new Map(),timers=[],elements={};let listener,active={id:'learner-a',email:'a@example.org'},state=options.state||{courses:{}};
 const doc={getElementById:id=>elements[id]||null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener:()=>{},body:{dataset:{view:'page'}},hidden:false};
 const client={auth:{onAuthStateChange:cb=>listener=cb,getSession:async()=>options.getSession?options.getSession(listener):({data:{session:active?{user:active}:null}}),getUser:async()=>options.getUser?options.getUser():({data:{user:active}})},from:()=>{const q={select:()=>q,eq:()=>q,maybeSingle:()=>q,retry:()=>q,abortSignal:()=>options.remote?options.remote():Promise.resolve({data:{state:{courses:{}},revision:0}})};return q;},rpc:async()=>({data:{state:{courses:{}},revision:1}})};
 const context={window:{CLOUD_STATE:null,CLAUDELAB_CLOUD:{url:'https://test.supabase.co',publishableKey:'public'},supabase:{createClient:()=>client},COURSES:[],addEventListener:()=>{}},document:doc,crypto:{randomUUID},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>null},location:{hash:'#/me',href:'http://127.0.0.1:4173/#/me'},history:{replaceState:()=>{}},navigator:{onLine:true,webdriver:true},AbortSignal,URL,URLSearchParams,setTimeout:(fn,ms)=>{const t={fn,ms};timers.push(t);return t;},clearTimeout:t=>{if(t)t.cancelled=true;},setInterval:()=>{},Date,console};
 vm.createContext(context);vm.runInContext(fs.readFileSync('assets/js/cloud-state.js','utf8'),context);vm.runInContext(fs.readFileSync('assets/js/admin.js','utf8'),context);vm.runInContext(fs.readFileSync('assets/js/account.js','utf8'),context);
 const api={getState:()=>state,applyState:next=>state=plain(next),refresh:()=>options.refresh?.(),download:()=>{}};
 const init=context.window.ACCOUNT.init(api);if(!options.deferInit)await init;
 return {context,storage,timers,elements,init,getState:()=>state,setActive:u=>{active=u;},emit:(ev,s)=>listener(ev,s),runTimers:async()=>{for(const t of timers.splice(0))if(!t.cancelled&&t.ms===0){t.fn();await new Promise(r=>setImmediate(r));}}};
}

test('a delayed user verification cannot restore an account after sign-out',async()=>{
 const late=deferred();let reads=0;
 const h=await harness({getUser:()=>++reads===1?Promise.resolve({data:{user:{id:'learner-a',email:'a@example.org'}}}):late.promise});
 h.emit('SIGNED_IN',{user:{id:'learner-a'}});await h.runTimers();
 h.emit('SIGNED_OUT',null);await h.runTimers();assert.equal(h.context.window.ACCOUNT.isSignedIn(),false);
 late.resolve({data:{user:{id:'learner-a',email:'a@example.org'}}});await new Promise(r=>setImmediate(r));
 assert.equal(h.context.window.ACCOUNT.isSignedIn(),false);
});

test('saved session recovery during startup restores the verified account',async()=>{
 const session={user:{id:'learner-a',email:'a@example.org'}};
 const h=await harness({getSession:async emit=>{emit('SIGNED_IN',session);return {data:{session}};}});
 assert.equal(h.context.window.ACCOUNT.isSignedIn(),true);
});

test('sign-out during startup wins over a late saved session',async()=>{
 const late=deferred();const h=await harness({deferInit:true,getUser:()=>late.promise});
 await new Promise(r=>setImmediate(r));h.emit('SIGNED_OUT',null);
 late.resolve({data:{user:{id:'learner-a',email:'a@example.org'}}});await h.init;
 assert.equal(h.context.window.ACCOUNT.isSignedIn(),false);
});

test('offline sign-in keeps guest edits made while account progress loads',async()=>{
 const load=deferred();const h=await harness({deferInit:true,state:{courses:{},notes:{}},remote:()=>load.promise});
 await new Promise(r=>setImmediate(r));
 h.getState().notes.new={a:'Guest note typed during loading'};h.getState().courses.cowork={completed:{welcome:true}};h.context.window.ACCOUNT.onSave();
 load.resolve({error:Error('offline')});await h.init;
 const guest=JSON.parse(h.storage.get('claudelab.guest'));
 assert.equal(guest.notes.new?.a,'Guest note typed during loading');
 assert.equal(guest.courses.cowork?.completed?.welcome,true);
});

test('a stale owner report cannot render after signing out',async()=>{
 const h=await harness();const report=deferred();
 h.context.location.hash='#/admin';h.elements.content={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};h.elements.refreshAdmin={};
 // The client returned by the factory is the same instance used by ACCOUNT.
 const c=h.context.window.supabase.createClient();c.rpc=()=>({retry(){return this;},abortSignal(){return report.promise;}});
 const pending=h.context.window.ACCOUNT.renderAdmin();h.emit('SIGNED_OUT',null);await h.runTimers();
 report.resolve({data:{summary:{learners:1,active_7_days:1,active_seconds_30_days:1,events_30_days:1,learner_limit:1,database_bytes:1},learners:[{display_name:'PRIVATE OWNER RESULT',email:'private@example.org',completed_lessons:0,quiz_attempts:0}],lessons:[]}});
 await pending;
 assert.equal(h.elements.content.innerHTML.includes('PRIVATE OWNER RESULT'),false);
});

test('account startup mounts the private dashboard once despite intermediate route refreshes',async()=>{
 const verification=deferred();let h,mounts=0;
 h=await harness({deferInit:true,getUser:()=>verification.promise,refresh:()=>h.context.window.ACCOUNT.renderAdmin()});
 h.context.location.hash='#/admin';h.elements.content={innerHTML:'',querySelector:()=>null,querySelectorAll:()=>[]};
 h.context.window.ADMIN_DASHBOARD.mount=async()=>{mounts++;};
 await h.context.window.ACCOUNT.renderAdmin();await h.context.window.ACCOUNT.renderAdmin();
 verification.resolve({data:{user:{id:'learner-a',email:'a@example.org'}}});await h.init;
 // Run any old startup callbacks after the account is ready, as a slow browser would.
 for(const timer of h.timers.splice(0))if(!timer.cancelled&&timer.ms===300)await timer.fn();
 assert.equal(mounts,1,'startup must not reset an already visible private dashboard');
});

test('guest review cards alone are offered for import',async()=>{
 const h=await harness({state:{courses:{},cards:{one:{f:'Question',b:'Answer',c:'cowork',l:'the-brief',box:1}}}});
 h.context.location.hash='#/account';h.elements.content={innerHTML:''};h.context.window.ACCOUNT.renderAccount();
 assert.ok(h.elements.content.innerHTML.includes('Import guest progress'));
});

async function settle(h){for(let n=0;n<6;n++){for(const t of h.timers.splice(0))if(!t.cancelled)await t.fn();await new Promise(r=>setImmediate(r));}}

test('a reset on another device does not turn the local resume place into a partial record',async()=>{
 const uploads=[];let reads=0;
 const h=await harness({remote:()=>Promise.resolve({data:{state:++reads===1?{courses:{},last:{c:'cowork',l:'welcome',t:1}}:{courses:{}},revision:reads}})});
 const c=h.context.window.supabase.createClient();
 c.rpc=async(name,args)=>{uploads.push(plain(args.body));return {data:{state:args.body,revision:9}};};
 h.getState().last.t=2;h.context.window.ACCOUNT.onSave();await settle(h);
 assert.equal(uploads.length,1,'the change must still be uploaded');
 assert.deepEqual(uploads[0].last,{c:'cowork',l:'welcome',t:2});
 assert.equal(h.context.window.CLOUD_STATE.validState(uploads[0]),true);
});

test('sync refuses to upload a merged state the app could not load back',async()=>{
 const uploads=[];
 const h=await harness();
 const c=h.context.window.supabase.createClient();
 c.rpc=async(name,args)=>{uploads.push(plain(args.body));return {data:{state:args.body,revision:9}};};
 // Simulate a merge that produces a record this app would reject on load.
 h.context.window.CLOUD_STATE.apply=()=>({courses:{},last:{t:2}});
 h.elements.accountStatus={textContent:''};
 h.getState().last={c:'cowork',l:'welcome',t:2};h.context.window.ACCOUNT.onSave();await settle(h);
 assert.deepEqual(uploads,[]);
 assert.match(h.elements.accountStatus.textContent,/could not be merged/);
});

test('a fresh account whose server copy is empty still uploads a resume place',async()=>{
 const uploads=[];
 const h=await harness({remote:()=>Promise.resolve({data:{state:{},revision:0}})});
 const c=h.context.window.supabase.createClient();
 c.rpc=async(name,args)=>{uploads.push(plain(args.body));return {data:{state:args.body,revision:1}};};
 h.getState().last={c:'cowork',l:'welcome',t:1};h.context.window.ACCOUNT.onSave();await settle(h);
 assert.equal(uploads.length,1,'the first change must be uploaded');
 assert.deepEqual(uploads[0],{courses:{},last:{c:'cowork',l:'welcome',t:1}});
});

test('one event the database rejects does not block the rest of the learning-event queue',async()=>{
 const uid='learner-a',bad='00000000-0000-4000-8000-00000000bad0';
 const queued=[{id:bad,session_id:'00000000-0000-4000-8000-000000000001',type:'view',course:'cowork',lesson:'brand-new-lesson'},
  {id:'00000000-0000-4000-8000-000000000002',session_id:'00000000-0000-4000-8000-000000000001',type:'view',course:'cowork',lesson:'welcome'},
  {id:'00000000-0000-4000-8000-000000000003',session_id:'00000000-0000-4000-8000-000000000001',type:'complete',course:'cowork',lesson:'welcome',done:true}];
 const h=await harness();
 h.storage.set('claudelab.events.'+uid,JSON.stringify(queued));
 const c=h.context.window.supabase.createClient();const uploaded=[];let calls=0;
 c.rpc=(name,args)=>({retry(){return this;},abortSignal(){calls++;if(name!=='record_learning_events')return Promise.resolve({data:{state:{courses:{}},revision:1}});
  if(args.batch.some(e=>e.id===bad))return Promise.resolve({error:{code:'23503',message:'lesson is not in the catalog'}});
  uploaded.push(...args.batch.map(e=>e.id));return Promise.resolve({data:args.batch.length});}});
 h.emit('SIGNED_OUT',null);await h.runTimers();h.emit('SIGNED_IN',{user:{id:uid}});await h.runTimers();
 h.elements.accountStatus={textContent:''};
 h.context.window.ACCOUNT.record({type:'studio'});
 for(let n=0;n<12;n++){for(const t of h.timers.splice(0))if(!t.cancelled)await t.fn();await new Promise(r=>setImmediate(r));}
 assert.deepEqual(uploaded.filter(id=>id.endsWith('02')||id.endsWith('03')).sort(),['00000000-0000-4000-8000-000000000002','00000000-0000-4000-8000-000000000003']);
 assert.equal(uploaded.includes(bad),false);
 assert.deepEqual(JSON.parse(h.storage.get('claudelab.events.'+uid)),[]);
 assert.match(h.elements.accountStatus.textContent,/skipped/);
 assert.ok(calls<12,'the bad event must be isolated in a few calls, not retried forever');
});

for(const [label,error] of [['a stale session (42501)',{code:'42501',message:'Sign in required'}],['a network failure',{code:'',message:'TypeError: Failed to fetch'}],['a request timeout (DOMException code 23)',{name:'TimeoutError',code:23,message:'The operation was aborted due to timeout'}]]){
 test('learning events are kept and retried after '+label+', never dropped',async()=>{
  const uid='learner-a';
  const queued=[{id:'00000000-0000-4000-8000-000000000011',session_id:'00000000-0000-4000-8000-000000000001',type:'view',course:'cowork',lesson:'welcome'},
   {id:'00000000-0000-4000-8000-000000000012',session_id:'00000000-0000-4000-8000-000000000001',type:'complete',course:'cowork',lesson:'welcome',done:true}];
  const h=await harness();
  h.storage.set('claudelab.events.'+uid,JSON.stringify(queued));
  const c=h.context.window.supabase.createClient();
  c.rpc=(name)=>({retry(){return this;},abortSignal(){return Promise.resolve(name==='record_learning_events'?{error}:{data:{state:{courses:{}},revision:1}});}});
  const seen=[];h.elements.accountStatus={set textContent(v){seen.push(v);},get textContent(){return seen.join(' | ');}};
  h.emit('SIGNED_OUT',null);await h.runTimers();h.emit('SIGNED_IN',{user:{id:uid}});await h.runTimers();
  h.context.window.ACCOUNT.record({type:'studio'});
  for(let n=0;n<6;n++){const retries=h.timers.filter(t=>t.ms===30000);for(const t of h.timers.splice(0))if(!t.cancelled&&t.ms!==30000)await t.fn();h.timers.push(...retries);await new Promise(r=>setImmediate(r));}
  const kept=JSON.parse(h.storage.get('claudelab.events.'+uid)).map(e=>e.id);
  assert.ok(kept.includes(queued[0].id)&&kept.includes(queued[1].id),'queued events must survive: '+kept);
  assert.ok(h.timers.some(t=>t.ms===30000&&!t.cancelled),'a 30 s retry must be armed');
  assert.match(h.elements.accountStatus.textContent,/upload will retry/);
 });
}

test('a server fault that rejects every event stops draining the queue after a few skips',async()=>{
 const uid='learner-a';
 const queued=Array.from({length:12},(_,i)=>({id:'00000000-0000-4000-8000-0000000000'+String(20+i),session_id:'00000000-0000-4000-8000-000000000001',type:'view',course:'cowork',lesson:'welcome'}));
 const h=await harness();
 h.storage.set('claudelab.events.'+uid,JSON.stringify(queued));
 const c=h.context.window.supabase.createClient();
 c.rpc=(name)=>({retry(){return this;},abortSignal(){return Promise.resolve(name==='record_learning_events'?{error:{code:'22P02',message:'invalid input syntax'}}:{data:{state:{courses:{}},revision:1}});}});
 h.emit('SIGNED_OUT',null);await h.runTimers();h.emit('SIGNED_IN',{user:{id:uid}});await h.runTimers();
 h.context.window.ACCOUNT.record({type:'studio'});
 for(let n=0;n<40;n++){const retries=h.timers.filter(t=>t.ms===30000);for(const t of h.timers.splice(0))if(!t.cancelled&&t.ms!==30000)await t.fn();h.timers.push(...retries);await new Promise(r=>setImmediate(r));}
 const kept=JSON.parse(h.storage.get('claudelab.events.'+uid));
 assert.ok(kept.length>=queued.length-5,'at most five events may be skipped before the drain stops: '+kept.length+' kept');
 assert.ok(h.timers.some(t=>t.ms===30000&&!t.cancelled),'the queue must fall back to the 30 s retry');
});

test('signing out uploads the learning events still queued on this device instead of discarding them',async()=>{
 const uid='learner-a';
 const h=await harness();
 const c=h.context.window.supabase.createClient();const uploaded=[];
 c.rpc=(name,args)=>({retry(){return this;},abortSignal(){if(name==='record_learning_events'){uploaded.push(...args.batch.map(e=>e.type));return Promise.resolve({data:args.batch.length});}return Promise.resolve({data:{state:{courses:{}},revision:1}});}});
 c.auth.signOut=async()=>({});
 h.emit('SIGNED_OUT',null);await h.runTimers();h.emit('SIGNED_IN',{user:{id:uid}});await h.runTimers();
 uploaded.length=0;
 h.storage.set('claudelab.usage.allow','1'); // record() ignores automated browsers unless this flag is set
 // an event recorded just before signing out: its 2 s upload timer has not fired yet
 h.context.window.ACCOUNT.record({type:'studio'});
 assert.deepEqual(uploaded,[]);
 assert.equal(await h.context.window.ACCOUNT.signOut(),true);
 assert.deepEqual(uploaded,['studio']);
 assert.equal(h.context.window.ACCOUNT.isSignedIn(),false);
});

test('a failed upload during sign-out still signs the learner out and keeps the events for next time',async()=>{
 const uid='learner-a';
 const h=await harness();
 const c=h.context.window.supabase.createClient();
 c.rpc=(name)=>({retry(){return this;},abortSignal(){return Promise.resolve(name==='record_learning_events'?{error:{code:'XX000',message:'internal error'}}:{data:{state:{courses:{}},revision:1}});}});
 c.auth.signOut=async()=>({});
 h.emit('SIGNED_OUT',null);await h.runTimers();h.emit('SIGNED_IN',{user:{id:uid}});await h.runTimers();
 h.storage.set('claudelab.usage.allow','1');
 h.context.window.ACCOUNT.record({type:'studio'});
 assert.equal(await h.context.window.ACCOUNT.signOut(),true);
 assert.equal(h.context.window.ACCOUNT.isSignedIn(),false);
 assert.equal(JSON.parse(h.storage.get('claudelab.events.'+uid)).length,1,'the event must wait in storage for the next sign-in');
});
