import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdtemp,mkdir,rm,access} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,delimiter} from 'node:path';
import {spawnSync} from 'node:child_process';

async function blocks(file,language){
 const text=await readFile(new URL('../'+file,import.meta.url),'utf8');
 return [...text.matchAll(new RegExp('```'+language+'\\s*\\n([\\s\\S]*?)```','g'))].map(match=>match[1]);
}
async function fixture(t){
 const dir=await mkdtemp(join(tmpdir(),'claude-lab-examples-'));
 t.after(()=>rm(dir,{recursive:true,force:true}));
 const bin=join(dir,'bin'); await mkdir(bin);
 return {dir,bin,env:{...process.env,PATH:bin+delimiter+process.env.PATH}};
}
async function stub(bin,name,code){
 await writeFile(join(bin,name),'#!'+process.execPath+'\n'+code,{mode:0o700});
}

test('the published pre-commit gate passes only an explicit successful OK review',async t=>{
 const gate=(await blocks('content/cc/40-headless.md','bash')).find(code=>code.includes('.git/hooks/pre-commit'));
 assert.ok(gate,'the executable gate must be present in the lesson');
 const {dir,bin,env}=await fixture(t),file=join(dir,'pre-commit');
 await writeFile(file,gate);
 await stub(bin,'git',`if(process.env.DIFF_FAIL==='yes') process.exit(9); process.stdout.write('diff --git a/example.js b/example.js\\n+const safeFixture = true;\\n');`);
 await stub(bin,'claude',`process.stdin.resume(); process.stdin.on('end',()=>{process.stdout.write(process.env.REVIEW_REPLY||''); process.exit(Number(process.env.REVIEW_EXIT||0));});`);
 for(const {name,reply,exit=0,diffFail=false,allowed} of [
  {name:'explicit OK',reply:'OK\n',allowed:true},
  {name:'BLOCK',reply:'BLOCK: fixture defect',allowed:false},
  {name:'empty response',reply:'',allowed:false},
  {name:'ambiguous response',reply:'Probably OK',allowed:false},
  {name:'reviewer failure',reply:'OK',exit:9,allowed:false},
  {name:'diff failure',reply:'OK',diffFail:true,allowed:false}
 ]){
  const result=spawnSync('bash',[file],{env:{...env,REVIEW_REPLY:reply,REVIEW_EXIT:String(exit),DIFF_FAIL:diffFail?'yes':'no'},encoding:'utf8'});
  assert.ifError(result.error);
  assert.equal(result.status===0,allowed,name+': '+result.stderr);
 }
});

for(const lesson of ['content/cc/32-hooks.md','content/cc/91-templates.md']){
 test(lesson+' formatter handles spaces, missing paths and dependency failures',async t=>{
  const settings=(await blocks(lesson,'json')).map(text=>JSON.parse(text)).find(value=>value.hooks?.PostToolUse);
  assert.ok(settings,'the actual PostToolUse example must exist');
  const command=settings.hooks.PostToolUse.find(hook=>hook.matcher==='Edit|Write').hooks[0].command;
  const {dir,bin,env}=await fixture(t),argsFile=join(dir,'args.json');
  await stub(bin,'jq',`let input=''; process.stdin.setEncoding('utf8'); process.stdin.on('data',chunk=>input+=chunk); process.stdin.on('end',()=>process.stdout.write(JSON.parse(input).tool_input?.file_path||''));`);
  await stub(bin,'npx',`require('node:fs').writeFileSync(process.env.FORMAT_ARGS,JSON.stringify(process.argv.slice(2))); process.exit(Number(process.env.FORMAT_EXIT||0));`);
  const path='src/screens/Quarterly Review.tsx';
  let result=spawnSync('sh',['-c',command],{input:JSON.stringify({tool_input:{file_path:path}}),env:{...env,FORMAT_ARGS:argsFile},encoding:'utf8'});
  assert.ifError(result.error); assert.equal(result.status,0,result.stderr);
  assert.deepEqual(JSON.parse(await readFile(argsFile,'utf8')),['--no-install','prettier','--write','--',path]);
  await rm(argsFile);
  result=spawnSync('sh',['-c',command],{input:JSON.stringify({tool_input:{}}),env:{...env,FORMAT_ARGS:argsFile},encoding:'utf8'});
  assert.equal(result.status,0,result.stderr);
  await assert.rejects(access(argsFile),{code:'ENOENT'});
  result=spawnSync('sh',['-c',command],{input:JSON.stringify({tool_input:{file_path:path}}),env:{...env,FORMAT_ARGS:argsFile,FORMAT_EXIT:'9'},encoding:'utf8'});
  assert.equal(result.status,9,'formatter failures must remain visible');
  await rm(argsFile);
  result=spawnSync('sh',['-c',command],{input:'{',env:{...env,FORMAT_ARGS:argsFile},encoding:'utf8'});
  assert.notEqual(result.status,0,'an input parser failure must remain visible');
  await assert.rejects(access(argsFile),{code:'ENOENT'});
 });
}

test('the published batch loop preserves filenames with spaces and the final unterminated line',async t=>{
 const loop=(await blocks('content/cc/41-parallel.md','bash')).find(code=>code.includes('files.txt'));
 assert.ok(loop,'the executable batch loop must exist');
 const {dir,bin,env}=await fixture(t),argsFile=join(dir,'calls.jsonl');
 await writeFile(join(dir,'files.txt'),'src/Quarterly Review.tsx\n\nsrc/Last file.tsx');
 await stub(bin,'claude',`require('node:fs').appendFileSync(process.env.CLAUDE_ARGS,JSON.stringify(process.argv.slice(2))+'\\n');`);
 const result=spawnSync('sh',['-c',loop],{cwd:dir,env:{...env,CLAUDE_ARGS:argsFile},encoding:'utf8'});
 assert.ifError(result.error); assert.equal(result.status,0,result.stderr);
 const calls=(await readFile(argsFile,'utf8')).trim().split('\n').map(line=>JSON.parse(line));
 assert.equal(calls.length,2);
 assert.deepEqual(calls.map(args=>args[1]),[
  'Migrate src/Quarterly Review.tsx from React class component to hooks. Return OK or FAIL.',
  'Migrate src/Last file.tsx from React class component to hooks. Return OK or FAIL.'
 ]);
 assert.ok(calls.every(args=>args.includes('dontAsk')&&args.includes('Read,Edit')));
});
