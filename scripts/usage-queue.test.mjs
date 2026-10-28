import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';

// usage.js runs route() at load, before account.js has verified a saved session.
function harness({signedIn=false,ready=false}={}){
 const sent=[],timers=[],store=new Map(),listeners={},el={textContent:'',value:''};
 const account={isSignedIn:()=>signedIn,isReady:()=>ready,recordUsage:ev=>sent.push({account:true,type:ev.type})};
 const ctx={
  window:{SITE:{analytics:'https://usage.example.test'},COURSES:[{id:'cowork'}],ACCOUNT:account,innerWidth:1200,crypto:globalThis.crypto,addEventListener:(k,fn)=>{(listeners[k]=listeners[k]||[]).push(fn);},dispatchEvent:ev=>{(listeners[ev.type]||[]).forEach(fn=>fn(ev));}},
  document:{querySelector:()=>null,getElementById:()=>el,addEventListener:()=>{},referrer:'https://google.com/',scrollingElement:null,documentElement:null,visibilityState:'visible'},
  location:{hash:'#/cowork/welcome'},navigator:{webdriver:false,sendBeacon:()=>true},
  localStorage:{getItem:k=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},sessionStorage:{getItem:k=>store.get('s:'+k)??null,setItem:(k,v)=>store.set('s:'+k,v)},
  fetch:(url,opts)=>{sent.push({url,events:JSON.parse(opts.body).events.map(e=>e.type)});return Promise.resolve({status:204,ok:true});},
  setTimeout:(fn,ms)=>{timers.push({fn,ms});return timers.length;},clearTimeout:()=>{},Date,JSON,String,Array,Object,Math,Uint8Array,URL,Blob:class{},Promise,Event:class{constructor(type){this.type=type;}},console
 };
 ctx.crypto=globalThis.crypto;vm.createContext(ctx);vm.runInContext(fs.readFileSync(new URL('../assets/js/usage.js',import.meta.url),'utf8'),ctx);
 // the 20 s fallback is a separate timer; ordinary runs leave it armed
 return {sent,timers,store,account,ctx,ready(){ready=true;ctx.window.dispatchEvent({type:'claudelab:accountready'});},signIn(){signedIn=true;},runTimers(){const keep=timers.filter(t=>t.ms===20000);for(const t of timers.splice(0))if(t.ms!==20000)t.fn();timers.push(...keep);}};
}

test('a signed-in learner reloading a lesson is not counted as a guest while the account is still being verified',()=>{
 const h=harness();
 h.runTimers();
 assert.deepEqual(h.sent,[],'nothing may be sent before the account is known');
 assert.equal(h.store.has('claudelab.usage'),false,'no guest browser id may be written');
 h.signIn();h.ready();h.runTimers();
 assert.ok(h.sent.length>0&&h.sent.every(s=>s.account===true),JSON.stringify(h.sent));
 assert.equal(h.store.has('claudelab.usage'),false);
});

test('a guest\'s page view is sent to the collector once the account check finishes',()=>{
 const h=harness();
 h.ready();h.runTimers();
 const fetched=h.sent.filter(s=>s.url);
 assert.equal(fetched.length,1,JSON.stringify(h.sent));
 assert.deepEqual(fetched[0].events,['session','view']);
 assert.equal(h.store.has('claudelab.usage'),true);
});

test('if the account check never finishes, the visit is filed as a guest\'s after the fallback and later events are not held',async()=>{
 const h=harness();
 h.runTimers();
 assert.deepEqual(h.sent,[],'still held before the fallback');
 const fallback=h.timers.find(t=>t.ms===20000);
 assert.ok(fallback,'a fallback timer must exist');
 h.timers.splice(0);fallback.fn();h.runTimers();
 assert.equal(h.sent.filter(s=>s.url).length,1,JSON.stringify(h.sent));
 await new Promise(r=>setImmediate(r)); // the first upload's promise settles
 h.ctx.location.hash='#/cowork/what-is-cowork';h.ctx.window.dispatchEvent({type:'hashchange'});
 h.runTimers();
 const later=h.sent.filter(s=>s.url).slice(1);
 assert.ok(later.length>=1&&later.some(s=>s.events.includes('view')),'a later view must reach the collector: '+JSON.stringify(h.sent));
});
