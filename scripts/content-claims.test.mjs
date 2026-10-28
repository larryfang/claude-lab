import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,readdir} from 'node:fs/promises';

async function lessons(dir){
 const names=(await readdir(new URL('../'+dir+'/',import.meta.url))).filter(name=>name.endsWith('.md')).sort();
 return Promise.all(names.map(async name=>({file:dir+'/'+name,text:await readFile(new URL('../'+dir+'/'+name,import.meta.url),'utf8')})));
}

test('the 6 October 2026 Cowork execution change is described as in effect, not upcoming',async()=>{
 const files=await lessons('content');
 const mentions=files.filter(({text})=>/6 October/.test(text));
 assert.ok(mentions.length>=3,'the dated change must still be explained where schedules and execution are taught');
 for(const {file,text} of mentions){
  for(const line of text.split('\n').filter(line=>/6 October/.test(line)).map(line=>line.replace(/\*\*/g,''))){
   assert.doesNotMatch(line,/move to the cloud on 6 October|From 6 October 2026|On 6 October 2026, new|Anthropic says new/,file+': still describes the change as upcoming: '+line.slice(0,120));
   assert.match(line,/Since 6 October 2026|since 6 October 2026|before 6 October 2026/,file+': must date the change as in effect: '+line.slice(0,120));
  }
 }
 const note=files.find(({file})=>file.endsWith('01-what-is-cowork.md')).text;
 assert.doesNotMatch(note,/checked 3 October 2026/,'the execution note must carry the date it was re-checked');
 assert.match(note,/"Only on your computer" setting was removed/,'the removed setting is the concrete change learners can look for');
 assert.match(note,/use Claude Code in the desktop app/,'the local-only alternative must be named');
 const schedules=files.find(({file})=>file.endsWith('62-schedules.md')).text;
 assert.match(schedules,/schedules created before that date keep running on your computer/,'existing local schedules must be distinguished from new cloud schedules');
});
