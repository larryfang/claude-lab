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

test('Claude Code lessons carry the v2.1.302 headless Manual default and the v2.1.295 hook fail-closed option',async()=>{
 const files=Object.fromEntries((await lessons('content/cc')).map(({file,text})=>[file.split('/').pop(),text]));
 for(const name of ['22-permissions.md','40-headless.md']) assert.match(files[name],/v2\.1\.302[^\n]*Manual[^\n]*denie[^\n]*permission-prompt-tool/,name+': headless runs with no mode start in Manual and deny calls that need approval unless an allow rule, hook or permission prompt tool answers');
 assert.match(files['32-hooks.md'],/"onFailure": "block"[^\n]*`http`[^\n]*v2\.1\.295/,'32-hooks.md: command and http hooks can fail closed since v2.1.295');
 assert.match(files['32-hooks.md'],/before a skill or custom command expands/,'32-hooks.md: UserPromptSubmit ordering');
});

test('Claude Code lessons describe idle compaction, the sed -i rewind limit and the whole-name MCP rule form',async()=>{
 const files=Object.fromEntries((await lessons('content/cc')).map(({file,text})=>[file.split('/').pop(),text]));
 assert.match(files['12-context-mgmt.md'],/v2\.1\.299[^\n]*idle compaction[^\n]*"idleCompaction": false/,'12-context-mgmt.md: idle compaction (v2.1.299) and how to turn it off');
 assert.match(files['12-context-mgmt.md'],/`sed -i`[^\n]*v2\.1\.309[^\n]*not restored/,'12-context-mgmt.md: sed -i is not restored by /rewind (v2.1.309)');
 assert.match(files['31-subagents.md'],/`effort`[^\n]*v2\.1\.292/,'31-subagents.md: per-call effort parameter (v2.1.292)');
 assert.match(files['31-subagents.md'],/`autoCompactWindow`[^\n]*v2\.1\.296/,'31-subagents.md: autoCompactWindow field (v2.1.296)');
 assert.match(files['22-permissions.md'],/MCP allow rules[^\n]*mcp__[a-z]+__\*[^\n]*a__b/,'22-permissions.md: MCP allow rules name the whole server');
});

test('every bash block in the Claude Code course parses, and in-session slash commands are not in shell blocks',async()=>{
 const {spawnSync}=await import('node:child_process');
 const {writeFileSync,mkdtempSync,rmSync}=await import('node:fs');const {tmpdir}=await import('node:os');const {join}=await import('node:path');
 const dir=mkdtempSync(join(tmpdir(),'claude-lab-bash-'));
 try{
  for(const {file,text} of await lessons('content/cc')){
   let n=0;
   for(const match of text.matchAll(/```bash\s*\n([\s\S]*?)```/g)){
    const code=match[1];const path=join(dir,'block-'+(n++)+'.sh');writeFileSync(path,code);
    const result=spawnSync('bash',['-n',path],{encoding:'utf8'});
    assert.equal(result.status,0,file+' bash block '+n+': '+result.stderr.trim());
    assert.doesNotMatch(code,/^\s*\/[a-z-]+(\s|$)/m,file+' bash block '+n+' holds an in-session slash command, which fails when pasted into a shell');
   }
  }
 }finally{rmSync(dir,{recursive:true,force:true});}
});

test('practice-data labs give the learner every input they are told to use',async()=>{
 const files=Object.fromEntries((await lessons('content')).map(({file,text})=>[file.split('/').pop(),text]));
 assert.match(files['42-lab-battlecard.md'],/:::details[^\n]*product[\s\S]*gtm\/our-product-capabilities\.txt/i,'42: a practice learner needs own-product documentation to finish Step 2');
 assert.match(files['33-lab-outreach.md'],/invented name can match a real company/,'33: practice accounts must not be researched on the public web');
 assert.doesNotMatch(files['11-the-brief.md'],/`discovery\/`/,'11: the model brief must point at the practice folder that exists (product/)');
 assert.match(files['41-lab-launch-kit.md'],/INPUTS\. Only `gtm\/launch-brief-rough\.txt`/,'41: the practice path must name its input files');
 assert.doesNotMatch(files['80-capstone.md'],/confirm it read the first run's file in `Cowork-Reports`\n/,'80: the second-run check must work without a Cowork-Reports connector');
 const sheet=await readFile(new URL('../content/cc/90-cheatsheet.md',import.meta.url),'utf8');
 for(const cmd of ['/checkup','/workflows','/config','/output-style']) assert.match(sheet,new RegExp('\\| `'+cmd.replace('/','\\/')),'cheat sheet must list '+cmd);
 assert.match(sheet,/`claude plugin details/,'cheat sheet must list claude plugin details');
});
