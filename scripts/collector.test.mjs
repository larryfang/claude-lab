import test from 'node:test';import assert from 'node:assert/strict';
import collect from '../api/collect.js';
async function request(body){let status=0;const res={setHeader(){},status(n){status=n;return this;},end(){return this;}};await collect({method:'POST',body},res);return status;}
test('collector applies the size limit to platform-parsed request bodies',async()=>{
 const body={events:[],padding:'é'.repeat(40000)};
 for(const input of [body,JSON.stringify(body),Buffer.from(JSON.stringify(body))])assert.equal(await request(input),413);
 assert.equal(await request({events:[]}),200);
});

test('rate-limited events are rejected so the browser stops retrying them',async(t)=>{
 const {createCollector}=await import('../api/collect.js');
 const fresh=createCollector(async()=>{});
 let payload='';const res={setHeader(){},status(){return this;},end(body){payload=body||'';return this;}};
 const visitor='v'.repeat(12),session='s'.repeat(12),now=Date.now();
 const batch=n=>({events:Array.from({length:n},(_,i)=>({type:'view',page:'lesson',visitor,session,t:now,id:'e'+String(i).padStart(8,'0')+Math.random().toString(36).slice(2,10)}))});
 for(let i=0;i<3;i++)await fresh({method:'POST',body:batch(30)},res);
 await fresh({method:'POST',body:batch(5)},res);
 const last=JSON.parse(payload);
 assert.equal(last.accept.length,0);
 assert.equal(last.reject.length,5,'throttled ids must be returned as rejected');
});
