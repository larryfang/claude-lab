import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

const FIXTURE='tests/fixtures/claude-help-2.1.312.txt';
const VERSION=FIXTURE.match(/claude-help-([\d.]+)\.txt$/)[1];
// Subcommand help captured at the same version; flags that only exist on a subcommand live here.
// Limit: flags are checked against the union of these captures, and only the first word after
// `claude` is checked as a subcommand, so a flag listed on the wrong row still passes.
const SUBCOMMAND_FIXTURES=['tests/fixtures/claude-ultrareview-help-'+VERSION+'.txt','tests/fixtures/claude-plugin-install-help-'+VERSION+'.txt','tests/fixtures/claude-plugin-help-'+VERSION+'.txt'];

async function read(file){ return readFile(new URL('../'+file,import.meta.url),'utf8'); }

function helpSections(help){
 const options=help.split('\n').filter(line=>/^\s{2}-/.test(line)).flatMap(line=>line.match(/--[a-zA-Z-]+/g)||[]);
 const shorts=[...help.matchAll(/^\s{2}(-[a-zA-Z]), --/gm)].map(match=>match[1]);
 const commands=[...help.slice(help.indexOf('\nCommands:')).matchAll(/^\s{2}([a-z-]+)(?:\|([a-z-]+))?/gm)].flatMap(match=>[match[1],match[2]].filter(Boolean));
 return {options:new Set(options),shorts:new Set(shorts),commands:new Set(commands)};
}

test('the cheat sheet and what\'s new page are pinned to the captured CLI version',async()=>{
 for(const file of ['content/cc/90-cheatsheet.md','content/cc/93-whats-new.md']){
  const text=await read(file);
  assert.match(text,new RegExp('Reviewed against (\\*\\*Claude Code )?v'+VERSION.replace(/\./g,'\\.')),file+' must state the version the course was checked against in its "Reviewed against" line');
 }
});

test('every shell flag and subcommand on the cheat sheet exists in the captured `claude --help`',async()=>{
 const help=helpSections(await read(FIXTURE));
 for(const file of SUBCOMMAND_FIXTURES) for(const flag of helpSections(await read(file)).options) help.options.add(flag);
 const sheet=await read('content/cc/90-cheatsheet.md');
 const launch=sheet.slice(sheet.indexOf('## Launch & flags'),sheet.indexOf('## In-session keys'));
 const commands=[...launch.matchAll(/`claude ([^`]+)`/g)].map(match=>match[1]);
 assert.ok(commands.length>=20,'the shell tables must still be present');
 for(const flag of launch.match(/(?<![\w-])--[a-z][a-z-]*/g)||[]) assert.ok(help.options.has(flag),flag+' is not in the captured help of `claude`, `claude ultrareview` or `claude plugin install`');
 for(const command of commands){
  for(const short of command.match(/(?<![\w-])-[a-zA-Z](?=\s|$)/g)||[]) assert.ok(help.shorts.has(short),short+' is not a short flag in `claude --help` ('+command+')');
  const sub=command.match(/^([a-z-]+)(?:\s|$)/);
  if(sub&&!sub[1].startsWith('-')) assert.ok(help.commands.has(sub[1]),'claude '+sub[1]+' is not a subcommand in `claude --help`');
 }
});

test('the cheat sheet covers the background-session subcommands the CLI ships',async()=>{
 const sheet=await read('content/cc/90-cheatsheet.md');
 for(const sub of ['agents','attach','logs','stop','rm','respawn']) assert.match(sheet,new RegExp('`claude '+sub+'\\b'),'claude '+sub+' must be on the cheat sheet');
});
