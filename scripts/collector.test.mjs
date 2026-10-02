import test from 'node:test';import assert from 'node:assert/strict';
import collect from '../api/collect.js';
async function request(body){let status=0;const res={setHeader(){},status(n){status=n;return this;},end(){return this;}};await collect({method:'POST',body},res);return status;}
test('collector applies the size limit to platform-parsed request bodies',async()=>{
 const body={events:[],padding:'é'.repeat(40000)};
 for(const input of [body,JSON.stringify(body),Buffer.from(JSON.stringify(body))])assert.equal(await request(input),413);
 assert.equal(await request({events:[]}),200);
});
