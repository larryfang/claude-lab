/* Real SQL and RLS checks in a disposable local PostgreSQL cluster. No production data. */
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const bindir=spawnSync('pg_config',['--bindir'],{encoding:'utf8'}).stdout?.trim();
const available=bindir&&fs.existsSync(path.join(bindir,'initdb'))&&process.getuid?.()!==0;
const uid=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
test('administrator SQL metrics, pagination and private access', {skip:!available&&!process.env.CI&&'Local PostgreSQL tools are unavailable'}, async t=>{
 assert.ok(available,'PostgreSQL is required for database verification in CI');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'claude-admin-pg-'));fs.chmodSync(dir,0o700);
 const env={...process.env,PGHOST:dir,PGPORT:'55439',PGDATABASE:'postgres',PGUSER:os.userInfo().username};
 const run=(bin,args,input)=>{const r=spawnSync(path.join(bindir,bin),args,{env,input,encoding:'utf8'});if(r.status!==0)throw Error(r.stderr||r.stdout);return r.stdout;};
 const sql=q=>run('psql',['-X','-A','-t','-v','ON_ERROR_STOP=1','-f','-'],q).trim();
 const as=(n,q)=>sql(`begin; set local role authenticated; select set_config('request.jwt.claim.sub','${uid(n)}',true); ${q}; rollback;`).split('\n').filter(x=>x.startsWith('{')||x==='t').at(-1);
 const dashboard=(extra='')=>JSON.parse(as(1,`select public.learning_admin_dashboard(${extra})`));
 let started=false;
 try{
  run('initdb',['-D',path.join(dir,'db'),'-A','trust','--no-locale','-E','UTF8']);
  run('pg_ctl',['-D',path.join(dir,'db'),'-l',path.join(dir,'server.log'),'-o',`-h '' -k ${dir} -p 55439`,'-w','start']);started=true;
  sql(`create role anon; create role authenticated; create schema auth; grant usage on schema auth to anon,authenticated;
   create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
   create table auth.users(id uuid primary key,email text,email_confirmed_at timestamptz,created_at timestamptz default now(),raw_user_meta_data jsonb default '{}',raw_app_meta_data jsonb default '{}');`);
  const migrations=fs.readdirSync(new URL('../supabase/migrations/',import.meta.url)).filter(f=>f.endsWith('.sql')).sort();
  for(const name of migrations){
   let source=fs.readFileSync(new URL('../supabase/migrations/'+name,import.meta.url),'utf8');
   // The isolated PostgreSQL fixture has no cron extension; retention is tested separately.
   source=source.replace(/create extension if not exists pg_cron;[\s\S]*?\$\$\);/,'');
   sql(source);
  }
  sql(`insert into public.lesson_catalog values ('cowork','welcome','Welcome',true),('cowork','next','Next',true),('code','intro','Code intro',true);
   insert into public.path_catalog values ('cowork','essentials',array['welcome','next']);
   insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data,raw_app_meta_data) values
   ('${uid(1)}','owner@example.invalid',now(),'{"full_name":"Owner"}','{"provider":"google"}'),
   ('${uid(2)}','session@example.invalid',now(),'{"full_name":"Finished session"}','{"provider":"github"}'),
   ('${uid(3)}','import@example.invalid',now(),'{"full_name":"Imported"}','{"provider":"google"}'),
   ('${uid(4)}','metadata@example.invalid',now(),'{"full_name":"No activity","admin":true,"email":"owner@example.invalid"}','{}'),
   ('${uid(5)}','return@example.invalid',now(),'{"full_name":"Returning"}','{"provider":"google"}'),
   ('${uid(6)}','unconfirmed@example.invalid',null,'{}','{}');
   insert into private.course_admin_emails values ('owner@example.invalid'),('unconfirmed@example.invalid');
   update public.learner_profiles set created_at=((now() at time zone 'UTC')::date-20)::timestamp at time zone 'UTC' where user_id in ('${uid(1)}','${uid(2)}','${uid(5)}');
   insert into public.learner_state(user_id,state) values
    ('${uid(2)}','{"courses":{"cowork":{"completed":{"welcome":true}}},"last":{"c":"cowork","l":"welcome","p":"essentials","s":"welcome"}}'),
    ('${uid(3)}','{"courses":{"cowork":{"completed":{"welcome":true,"next":true}}},"last":{"c":"cowork","l":"next"}}');
   insert into public.learning_daily values
    ('${uid(2)}',(now() at time zone 'UTC')::date-18,'cowork','welcome',1,1,0,0,0,now()-interval '18 days'),
    ('${uid(3)}',(now() at time zone 'UTC')::date,'cowork','welcome',1,5,4,1,60,now()),
    ('${uid(5)}',(now() at time zone 'UTC')::date-12,'cowork','welcome',1,1,0,0,30,now()-interval '12 days'),
    ('${uid(5)}',(now() at time zone 'UTC')::date-1,'cowork','welcome',1,1,0,0,30,now()-interval '1 day'),
    ('${uid(5)}',(now() at time zone 'UTC')::date,'code','intro',1,2,1,1,30,now());`);
  await t.test('only a confirmed server-allowlisted owner can call either report',()=>{
   assert.equal(as(1,'select public.learning_admin_access()'),'t');
   assert.equal(JSON.parse(as(1,'select public.learning_admin_report()')).summary.learners,6);
   assert.equal(sql("select count(*) from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'learning_admin_%' and p.prosecdef"),'0');
   for(const n of [4,6])for(const fn of ['learning_admin_access()','learning_admin_dashboard()','learning_admin_report()'])assert.throws(()=>as(n,'select public.'+fn),/Administrator access required/);
   assert.throws(()=>sql('set role anon; select public.learning_admin_dashboard();'),/permission denied/);
   assert.throws(()=>as(4,'select * from private.course_admin_emails'),/permission denied/);
   assert.equal(sql(`begin;set local role authenticated;select set_config('request.jwt.claim.sub','${uid(4)}',true);select count(*) from public.learner_state;rollback;`).includes('\n0\n'),true);
  });
  await t.test('period users are distinct across days and quiz accuracy is weighted',()=>{
   const d=dashboard();assert.equal(d.summary.registered_accounts,6);assert.equal(d.summary.active_learners,3);
   assert.equal(d.summary.quiz_attempts,5);assert.equal(d.summary.quiz_correct,2);assert.equal(d.daily.length,30);
   assert.equal(d.daily.at(-1).active_learners,2);assert.equal(d.daily.at(-1).lesson_views,2);
   assert.equal(d.providers.find(p=>p.provider==='github').accounts,1);
  });
  await t.test('window and course scope apply to activity; account totals stay global',()=>{
   const d=dashboard("7,'cowork'");assert.equal(d.summary.active_learners,2);assert.equal(d.summary.registered_accounts,6);
   assert.equal(d.summary.quiz_attempts,4);assert.equal(d.lessons.length,2);assert.equal(d.daily.length,7);assert.equal(d.directory.total,3);
  });
  await t.test('imported completions cannot inflate the viewer completion percentage',()=>{
   const d=dashboard("7,'cowork'");const next=d.lessons.find(l=>l.lesson==='next');assert.equal(next.current_completers,1);assert.equal(next.viewers,0);assert.equal(next.viewer_completers,0);
   for(const l of d.lessons)assert.ok(l.viewer_completers<=l.viewers);
  });
  await t.test('a finished selected session is complete, not falsely paused',()=>{
   const row=dashboard().directory.rows.find(r=>r.user_id===uid(2));assert.equal(row.scope_kind,'session');assert.equal(row.remaining_lessons,0);assert.equal(row.learning_status,'completed');
   sql(`update public.learner_state set state=jsonb_set(state,'{last,s}','"next,welcome"') where user_id='${uid(2)}'`);
   const invalid=dashboard().directory.rows.find(r=>r.user_id===uid(2));assert.equal(invalid.scope_kind,'path');assert.equal(invalid.learning_status,'paused');
  });
  await t.test('search and pagination do not shrink summary totals',()=>{
   const d=dashboard("30,'','import','',0,1");assert.equal(d.directory.rows.length,1);assert.equal(d.directory.total,1);assert.equal(d.summary.active_learners,3);
   assert.equal(dashboard("30,'','','',1,2").directory.rows.length,2);
   assert.equal(dashboard("30,'','','not_started'").directory.total,3);
   for(const args of ["1","30,'missing'","30,'','','wrong'","30,'','','',-1","30,'','','',0,101"])assert.throws(()=>dashboard(args),/Invalid report filters/);
  });
  await t.test('returning cohorts exclude accounts whose second week is not finished',()=>{
   const rows=dashboard().cohorts;assert.equal(rows.reduce((n,r)=>n+r.eligible,0),3);assert.equal(rows.reduce((n,r)=>n+r.returned,0),1);
   assert.ok(rows.some(r=>r.eligible===0));
  });
  await t.test('account completion cohort uses recorded events, not imported state',()=>{
   const d=dashboard('7');assert.equal(d.activation.accounts,3);assert.equal(d.activation.opened_lesson,1);assert.equal(d.activation.opened_and_completed,0);
   assert.equal(JSON.stringify(d).includes('"state"'),false);
  });
  await t.test('twelve weekly cohorts use UTC Monday boundaries',()=>{
   for(let i=0;i<12;i++){
    sql(`insert into auth.users(id,email,email_confirmed_at) values ('${uid(100+i)}','cohort${i}@example.invalid',now());update public.learner_profiles set created_at=(date_trunc('week',now() at time zone 'UTC')-interval '${i} weeks') at time zone 'UTC' where user_id='${uid(100+i)}'`);
   }
   sql(`insert into auth.users(id,email,email_confirmed_at) values ('${uid(99)}','previous-week@example.invalid',now());update public.learner_profiles set created_at=(date_trunc('week',now() at time zone 'UTC')-interval '11 weeks'-interval '1 day') at time zone 'UTC' where user_id='${uid(99)}'`);
   const cohorts=dashboard().cohorts;assert.equal(cohorts.length,12);
   const first=cohorts[0];assert.equal(first.accounts,1);assert.equal(new Date(first.week+'T00:00:00Z').getUTCDay(),1);
  });

 }finally{if(started)run('pg_ctl',['-D',path.join(dir,'db'),'-m','fast','-w','stop']);fs.rmSync(dir,{recursive:true,force:true});}
});
