import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';
import {createReportHandler} from '../api/report.js';import {verifyOwner} from '../analytics/admin-auth.mjs';
import {cleanEvent,summarize} from '../analytics/report.mjs';
import {adminFixture} from '../tests/fixtures/admin-report.mjs';
const catalog=new Map([['cowork/welcome',{course:'cowork',key:'cowork/welcome',id:'welcome',title:'Welcome',quizzes:[],reference:false}]]);catalog.paths=[];
async function invoke(handler,extra={}) {const result={};const res={writeHead(status,headers){Object.assign(result,{status,headers});},end(body){result.body=body;}};await handler({url:'/api/report?format=json',method:'GET',headers:{},...extra},res);return result;}
test('guest report rejects unauthenticated and non-owner requests before reading storage',async()=>{
 let reads=0;const handler=createReportHandler({read:async()=>{reads++;return [];},owner:async()=>false,token:()=>'',lessons:catalog});
 for(const headers of [{},{authorization:'Bearer fake.jwt.value'},{'x-analytics-token':'unknown'}])assert.equal((await invoke(handler,{headers})).status,401);
 assert.equal(reads,0);
});
test('owner report allows expected CORS preflight and denies other origins',async()=>{
 let reads=0;const handler=createReportHandler({read:async()=>{reads++;return [];},owner:async()=>true,lessons:catalog});
 const preflight=await invoke(handler,{method:'OPTIONS',headers:{origin:'https://larryfang.github.io'}});assert.equal(preflight.status,204);assert.equal(preflight.headers['access-control-allow-origin'],'https://larryfang.github.io');assert.equal(reads,0);
 assert.equal((await invoke(handler,{headers:{origin:'https://untrusted.invalid',authorization:'Bearer fake.jwt.value'}})).status,403);assert.equal(reads,0);
 const result=await invoke(handler,{headers:{origin:'https://larryfang.github.io',authorization:'Bearer fake.jwt.value'}});assert.equal(result.status,200);assert.equal(result.headers['cache-control'],'no-store');assert.equal(JSON.parse(result.body).visitors,0);
});
test('legacy report tokens remain supported and invalid windows are rejected',async()=>{
 const handler=createReportHandler({read:async()=>({events:[],coverage:{loaded_events:0,partial:false}}),owner:async()=>false,token:()=>'disposable-legacy-token',lessons:catalog});
 assert.equal((await invoke(handler,{headers:{'x-analytics-token':'disposable-legacy-token'}})).status,200);
 for(const url of ['/api/report?days=1','/api/report?course=missing'])assert.equal((await invoke(handler,{url,headers:{'x-analytics-token':'disposable-legacy-token'}})).status,400);
});
test('owner verification uses Supabase authorization, rejects non-true results, and never uses metadata',async()=>{
 let call;const token='Bearer aaaaaaa.bbbbbbb.cccccccccc';
 assert.equal(await verifyOwner(token,async(url,opts)=>{call={url,opts};return {status:200,ok:true,json:async()=>true};}),true);
 assert.match(call.url,/rpc\/learning_admin_access$/);assert.equal(call.opts.headers.Authorization,token);assert.equal(call.opts.body,'{}');
 assert.equal(await verifyOwner(token,async()=>({status:403,ok:false})),false);
 assert.equal(await verifyOwner(token,async()=>({status:200,ok:true,json:async()=>({admin:true})})),false);
 assert.equal(await verifyOwner('Bearer bad',()=>{throw Error('Must not send');}),false);
});
test('guest daily and period metrics deduplicate IDs, retain returning history, and separate sign-in clicks',()=>{
 const now=Date.UTC(2026,9,3,12),event=(id,type,extra={})=>({id,visitor:'browser00000001',session:'session00000001',t:now,type,...extra});
 const view=event('event000000002','view',{page:'lesson',course:'cowork',lesson:'welcome'});
 const data=summarize([event('event000000001','view',{t:now-10*864e5,page:'hub'}),view,view,event('event000000003','auth',{provider:'google'}),event('event000000004','quiz',{page:'lesson',course:'cowork',lesson:'welcome',correct:true})],catalog,now,{days:7});
 assert.equal(data.visitors,1);assert.equal(data.returningVisitors,1);assert.equal(data.lessonOpens,1);assert.equal(data.daily.length,7);assert.equal(data.daily.at(-1).visitors,1);assert.equal(data.signInStarts.google,1);assert.equal(data.quizCorrect,1);
 assert.equal(JSON.stringify(data).includes('browser00000001'),false);
 assert.equal(cleanEvent(event('event000000005','auth',{provider:'fake'}),now),null);
});
test('exports protect CSV formulas, preserve quotes, and keep reports aggregate-only',()=>{
 const context={window:{COURSES:[]}};vm.runInNewContext(fs.readFileSync('assets/js/admin.js','utf8'),context);
 const csv=context.window.ADMIN_DASHBOARD.csv(['Name'],[[' =1+1'],['@bad'],['normal,"quoted"']]);
 assert.match(csv,/"' =1\+1"/);assert.match(csv,/"'@bad"/);assert.match(csv,/"normal,""quoted"""/);
 const report=context.window.ADMIN_DASHBOARD.reportText(adminFixture());assert.match(report,/## Registered learners/);assert.equal(report.includes('@example.invalid'),false);
});
