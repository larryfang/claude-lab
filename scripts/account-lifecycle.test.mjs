import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import {randomUUID} from 'node:crypto';
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const plain=v=>JSON.parse(JSON.stringify(v));
async function harness(options={}){
 const storage=new Map(),timers=[],elements={};let listener,active={id:'learner-a',email:'a@example.org'},state=options.state||{courses:{}};
 const doc={getElementById:id=>elements[id]||null,querySelectorAll:()=>[],querySelector:()=>null,addEventListener:()=>{},body:{dataset:{view:'page'}},hidden:false};
 const client={auth:{onAuthStateChange:cb=>listener=cb,getSession:async()=>options.getSession?options.getSession(listener):({data:{session:active?{user:active}:null}}),getUser:async()=>options.getUser?options.getUser():({data:{user:active}})},from:()=>{const q={select:()=>q,eq:()=>q,maybeSingle:()=>q,retry:()=>q,abortSignal:()=>options.remote?options.remote():Promise.resolve({data:{state:{courses:{}},revision:0}})};return q;},rpc:async()=>({data:{state:{courses:{}},revision:1}})};
 const context={window:{CLOUD_STATE:null,CLAUDELAB_CLOUD:{url:'https://test.supabase.co',publishableKey:'public'},supabase:{createClient:()=>client},COURSES:[],addEventListener:()=>{}},document:doc,crypto:{randomUUID},localStorage:{getItem:k=>storage.get(k)||null,setItem:(k,v)=>storage.set(k,v),removeItem:k=>storage.delete(k)},sessionStorage:{getItem:()=>null},location:{hash:'#/me',href:'http://127.0.0.1:4173/#/me'},history:{replaceState:()=>{}},navigator:{onLine:true,webdriver:true},AbortSignal,URL,URLSearchParams,setTimeout:(fn,ms)=>{const t={fn,ms};timers.push(t);return t;},clearTimeout:t=>{if(t)t.cancelled=true;},setInterval:()=>{},Date,console};
 vm.createContext(context);vm.runInContext(fs.readFileSync('assets/js/cloud-state.js','utf8'),context);vm.runInContext(fs.readFileSync('assets/js/admin.js','utf8'),context);vm.runInContext(fs.readFileSync('assets/js/account.js','utf8'),context);
 const api={getState:()=>state,applyState:next=>state=plain(next),refresh:()=>{},download:()=>{}};
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

test('guest review cards alone are offered for import',async()=>{
 const h=await harness({state:{courses:{},cards:{one:{f:'Question',b:'Answer',c:'cowork',l:'the-brief',box:1}}}});
 h.context.location.hash='#/account';h.elements.content={innerHTML:''};h.context.window.ACCOUNT.renderAccount();
 assert.ok(h.elements.content.innerHTML.includes('Import guest progress'));
});
