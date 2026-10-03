/* Supabase accounts, private progress sync, and bounded learning events. */
(function(){
 'use strict';
 var config=window.CLAUDELAB_CLOUD, core=window.CLOUD_STATE, api, user=null, client=null, ready=false;
 var base={},revision=0,syncing=false,timer=null,generation=0,status='Progress saved on this device',authFeedback='';
 var authBusy=false,authEpoch=0,adminRequest=0,deferredAuth=null;
 var guest=null,events=[],eventTimer=null,sessionId=crypto.randomUUID(),lastInput=Date.now(),lastPulse=Date.now();
 function copy(v){return JSON.parse(JSON.stringify(v));}
 function read(k,f){try{return JSON.parse(localStorage.getItem(k))||f;}catch(e){return f;}}
 function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
 function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function flag(k,v){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}
 function cacheKey(id){return 'claudelab.account.'+id;}
 function validProgress(value){return !!value&&typeof value==='object'&&!Array.isArray(value)&&core.validState(Object.assign({courses:{}},value));}
 function guestState(){var state=read('claudelab.guest',{courses:{}});return validProgress(state)?state:{courses:{}};}
 function notify(message){status=message;var el=document.getElementById('accountStatus');if(el)el.textContent=message;var b=document.getElementById('accountBtn');if(b){b.setAttribute('aria-label',user?'Your account — '+message:'Sign in to save progress');b.title=user?message:'Sign in to save progress';b.querySelector('span').textContent=user?'Account':'Sign in';}}
 function localSave(){
  if(!api)return;
  if(user){write(cacheKey(user.id),{state:api.getState(),base:base,revision:revision});notify('Changes waiting to sync');schedule();}
  else{guest=copy(api.getState());write('claudelab.guest',guest);}
 }
 function schedule(){clearTimeout(timer);if(user)timer=setTimeout(sync,700);}
 async function remoteState(uid){var r=await client.from('learner_state').select('state,revision').eq('user_id',uid||user.id).maybeSingle().retry(false).abortSignal(AbortSignal.timeout(15000));if(r.error)throw r.error;var saved=r.data||{state:{},revision:0};if(!validProgress(saved.state))throw Error('Invalid saved progress');return saved;}
 async function sync(){
  if(!user)return;if(!navigator.onLine){notify('Saved on this device — sync needs a connection');return;}if(syncing){schedule();return;}syncing=true;var turn=generation,uid=user.id;
  var current=core.snapshot(api.getState()),changes=core.diff(base,current);
  try{
   var r=await remoteState();
   if(turn!==generation)return;
   if(!changes.length){
    base=r.state;revision=r.revision;
    var after=core.diff(current,core.snapshot(api.getState())),pulled=core.apply(base,after);
    if(core.diff(pulled,core.snapshot(api.getState())).length)api.applyState(pulled,true);
    write(cacheKey(uid),{state:api.getState(),base:base,revision:revision});notify('Progress synced');if(after.length)schedule();return;
   }
   for(var attempt=0;attempt<4;attempt++){
    if(turn!==generation)return;
    var merged=core.apply(r.state,changes),result=await client.rpc('save_learning_state',{expected_revision:r.revision,body:merged}).retry(false).abortSignal(AbortSignal.timeout(15000));
    if(turn!==generation)return;
    if(result.error){if(result.error.code==='PT409'){r=await remoteState();continue;}throw result.error;}
    var later=core.diff(current,core.snapshot(api.getState()));base=result.data.state;revision=result.data.revision;
    var next=core.apply(base,later);
    // Compare state values, not JSON field order: Postgres can reorder keys.
    // Ordinary background saves must leave the lesson and scroll position intact.
    if(core.diff(next,core.snapshot(api.getState())).length)api.applyState(next,true);
    write(cacheKey(uid),{state:api.getState(),base:base,revision:revision});notify('Progress synced');
    if(later.length)schedule();return;
   }
   throw Error('Another device is updating progress. Try sync again.');
  }catch(e){if(turn===generation)notify('Saved on this device — sync needs a connection');}
  finally{syncing=false;}
 }
 async function acceptUser(next){
  if(user && next && user.id===next.id)return;
  var previous=user;generation++;clearTimeout(timer);clearTimeout(eventTimer);
  if(previous)write(cacheKey(previous.id),{state:api.getState(),base:base,revision:revision});
  user=null;events=[];
  if(!next){flag('claudelab.accountOwner',null);base={};revision=0;api.applyState(guestState(),false);notify('Progress saved on this device');return;}
  // Keep the guest workspace active until the new account is actually loaded.
  // Edits made during a slow load must remain guest edits, not be discarded.
  if(previous){api.applyState(guestState(),false);flag('claudelab.accountOwner',null);}
  var turn=generation,cached=read(cacheKey(next.id),null);events=read('claudelab.events.'+next.id,[]);
  if(cached&&(!validProgress(cached.state)||!validProgress(cached.base||{})))cached=null;
  try{
   var remote=await remoteState(next.id);if(turn!==generation)return;
   var local=cached?core.snapshot(cached.state):remote.state;
   var pending=cached?core.diff(cached.base||{},local):[];
   base=remote.state;revision=remote.revision;
   guest=copy(api.getState());write('claudelab.guest',guest);user=next;
   api.applyState(Object.assign(core.apply(remote.state,pending),{notes:cached&&cached.state.notes||{},name:cached&&cached.state.name||''}),false);
   flag('claudelab.accountOwner',next.id);
   write(cacheKey(next.id),{state:api.getState(),base:base,revision:revision});notify(pending.length?'Changes waiting to sync':'Progress synced');
   if(pending.length)schedule();record({type:'view'});flushEvents();
  }catch(e){
   if(turn!==generation)return;
   if(!user){guest=copy(api.getState());write('claudelab.guest',guest);}user=next;
   base=cached&&cached.base||{};revision=cached&&cached.revision||0;
   api.applyState(cached?cached.state:{courses:{}},false);flag('claudelab.accountOwner',next.id);notify('Saved on this device — sync needs a connection');
  }
  if(isAccountRoute())renderAccount();
 }
 async function init(adapter){
  api=adapter;guest=copy(api.getState());
  // Existing local progress must survive the first account switch without import.
  write('claudelab.guest',guest);
  if(!config||!config.url||!config.publishableKey){ready=true;notify(status);if(isAccountRoute())api.refresh();return;}
  client=window.supabase.createClient(config.url,config.publishableKey,{auth:{flowType:'pkce',detectSessionInUrl:false,persistSession:true,autoRefreshToken:true}});
  client.auth.onAuthStateChange(function(event,session){
   if(event==='SIGNED_OUT'){authEpoch++;if(!ready)deferredAuth={session:null,request:authEpoch};acceptUser(null);}
   else if(event==='SIGNED_IN'||event==='USER_UPDATED'){
    var request=++authEpoch;
    if(ready)setTimeout(function(){if(request!==authEpoch)return;verifySession(session,request).catch(function(){if(request===authEpoch)notify('Could not verify your account. Please retry sign-in.');});},0);
    else deferredAuth={session:session,request:request};
   }
  });
  try{
   var callback=new URL(location.href),code=callback.searchParams.get('code');
   var hashParams=new URLSearchParams(callback.hash.slice(1));
   var callbackError=callback.searchParams.get('error')||hashParams.get('error');
   if(code||callbackError){
    // Remove provider details and authorization codes before rendering or exchanging.
    ['code','error','error_code','error_description','sb'].forEach(function(k){callback.searchParams.delete(k);});
    callback.hash='#/account';history.replaceState(null,'',callback.pathname+callback.search+callback.hash);
    if(callbackError){authFeedback=authProviderName()+(callbackError==='access_denied'?' sign-in was cancelled. You can try again or continue as a guest.':' sign-in could not finish. Please try again or continue as a guest.');throw Error('OAuth callback failed');}
    var exchanged=await client.auth.exchangeCodeForSession(code);if(exchanged.error)throw exchanged.error;
   }
   var sessionRequest=authEpoch,s=await client.auth.getSession();if(s.error)throw s.error;
   // Session recovery can emit SIGNED_IN while getSession is still pending.
   // Verify the latest event, including a sign-out, before finishing startup.
   var initial=deferredAuth||{session:s.data.session,request:sessionRequest};
   while(initial){deferredAuth=null;await verifySession(initial.session,initial.request);initial=deferredAuth;}
  }catch(e){if(!authFeedback)authFeedback='Sign-in could not finish. Please try again or continue as a guest.';notify('Sign-in could not finish. Open your account to retry.');}
  ready=true;notify(status);if(isAccountRoute())api.refresh();else refreshPrompts();
  window.addEventListener('online',function(){sync();flushEvents();});
  ['pointerdown','keydown','scroll'].forEach(function(k){document.addEventListener(k,function(){lastInput=Date.now();},{passive:true});});
  document.addEventListener('visibilitychange',function(){lastPulse=Date.now();if(document.hidden){sync();flushEvents();}});
  setInterval(function(){
   var now=Date.now(),seconds=Math.min(60,Math.floor((now-lastPulse)/1000));lastPulse=now;
   if(user && !document.hidden && now-lastInput<120000 && document.body.dataset.view==='lesson')record({type:'heartbeat',active_seconds:seconds});
  },30000);
 }
 async function verifySession(session,request){
  request=request===undefined?authEpoch:request;
  if(!session){if(request===authEpoch&&user)await acceptUser(null);return;}
  var r=await client.auth.getUser();if(request!==authEpoch)return;if(r.error)throw r.error;await acceptUser(r.data.user);
 }
 function currentPlace(){
  var raw=(location.hash||'').replace(/^#\/?/,'').split('?')[0].split('/');var c=window.COURSES.find(function(c){return c.id===raw[0];});
  var lesson=c&&c.modules.flatMap(function(m){return m.lessons;}).find(function(l){return l.id===raw[1];});
  if(!lesson)return {};
  var last=api.getState().last;var heads=(last&&last.c===c.id&&last.l===lesson.id?Array.from(document.querySelectorAll('article.lesson h2[id]')):[]).filter(function(h){return h.getBoundingClientRect().top<160;});
  return {course:c.id,lesson:lesson.id,section:heads.length?heads[heads.length-1].id.slice(0,120):null};
 }
 function record(input){
  if(!user||!client||(navigator.webdriver&&read('claudelab.usage.allow',null)!==1))return;
  var e=Object.assign({id:crypto.randomUUID(),session_id:sessionId,type:input.type},currentPlace());
  if(input.type!=='studio'&&(!e.course||!e.lesson))return;
  ['correct','done','active_seconds'].forEach(function(k){if(input[k]!==undefined)e[k]=input[k];});
  events.push(e);if(events.length>500)events.splice(0,events.length-500);write('claudelab.events.'+user.id,events);
  if(!eventTimer)eventTimer=setTimeout(flushEvents,2000);
 }
 var sending=false;
 async function flushEvents(){
  clearTimeout(eventTimer);eventTimer=null;if(!user||!navigator.onLine||sending||!events.length)return;sending=true;
  var turn=generation,uid=user.id,batch=events.slice(0,20);
  try{var r=await client.rpc('record_learning_events',{batch:batch}).retry(false).abortSignal(AbortSignal.timeout(15000));if(r.error)throw r.error;if(turn!==generation)return;
   var ids=new Set(batch.map(function(e){return e.id;}));events=events.filter(function(e){return !ids.has(e.id);});write('claudelab.events.'+uid,events);
   if(events.length)eventTimer=setTimeout(flushEvents,200);
  }catch(e){if(turn===generation){notify('Activity saved on this device — upload will retry');eventTimer=setTimeout(flushEvents,30000);}}
  finally{sending=false;if(turn!==generation&&events.length)eventTimer=setTimeout(flushEvents,200);}
 }
 function usage(e){if(['view','complete','quiz'].indexOf(e.type)<0)return;record({type:e.type,correct:e.correct,done:e.done});}
 function guestHasProgress(){return user && !read('claudelab.importDismissed.'+user.id,false) && guest && (Object.keys(guest.cards||{}).length||Object.keys(guest.daily||{}).length||Object.values(guest.courses||{}).some(function(c){return Object.keys(c.completed||{}).length||Object.keys(c.checks||{}).length||Object.keys(c.quiz||{}).length||Object.keys(c.ex||{}).length;}));}
 function authProviderName(){try{return sessionStorage.getItem('claudelab.authSource')==='github'?'GitHub':'Google';}catch(e){return 'Google';}}
 async function startOAuth(provider){
  if(authBusy)return;
  var feedback=document.getElementById('authFeedback'),label=provider==='github'?'GitHub':'Google';
  if(!client||location.protocol==='file:'){feedback.textContent='Open the published site to sign in securely.';return;}
  authBusy=true;document.querySelectorAll('[data-auth-provider]').forEach(function(b){b.disabled=true;});
  feedback.textContent='Connecting to '+label+'…';
  try{
   if(provider==='github'){
    var settings=await fetch(config.url+'/auth/v1/settings',{headers:{apikey:config.publishableKey},signal:AbortSignal.timeout(10000)});
    if(!settings.ok)throw Error('Provider check failed');
    var available=await settings.json();
    if(!available.external||!available.external.github){authFeedback='GitHub sign-in is not available yet. Continue with Google to save your progress.';return;}
   }
   try{sessionStorage.setItem('claudelab.authSource',provider);}catch(e){}
   var r=await client.auth.signInWithOAuth({provider:provider,options:{redirectTo:location.origin+location.pathname,scopes:provider==='google'?'openid email profile':'user:email'}});if(r.error)throw r.error;
  }catch(e){authFeedback='Could not start '+label+' sign-in. Please try again'+(provider==='github'?' or continue with Google.':'.');}
  finally{authBusy=false;if(feedback.isConnected)feedback.textContent=authFeedback;document.querySelectorAll('[data-auth-provider]').forEach(function(b){b.disabled=false;});}
 }
 function guestPrompt(){
  if(user||!config||!config.url)return '';
  return '<aside class="guest-prompt" aria-label="Save your progress"><div><span class="micro-label">LEARNING AS A GUEST</span><h2>Make your progress yours.</h2><p>Save lessons, quiz results and review cards across devices. Right now, your progress stays only in this browser.</p></div><div class="guest-prompt-actions"><a class="btn btn-primary" href="#/account">Save progress with Google</a><a href="#/account">Or sign in with GitHub</a><small>Free · Gmail or any Google account</small></div></aside>';
 }
 function refreshPrompts(){document.querySelectorAll('[data-guest-prompt]').forEach(function(el){el.innerHTML=guestPrompt();});}
 function isAccountRoute(){return (location.hash||'').replace(/^#\/?/,'').split('?')[0].split('/').filter(Boolean)[0]==='account';}
 function renderAccount(){
  var content=document.getElementById('content');if(!api||!content||!isAccountRoute())return;
  var html='<section class="account-panel"><span class="micro-label">YOUR LEARNING ACCOUNT</span><h1>'+ (user?'Pick up where you left off.':'Save your learning. Keep your momentum.')+'</h1>';
  if(!ready)html+='<p role="status">Checking your account…</p>';
  else if(!client){html+='<p>Accounts are unavailable in this preview. Your progress is still saved on this device.</p><a href="#/">Continue learning →</a>';}
  else if(!user){
   html+='<p>Keep your completed lessons, quiz results and review cards across devices. Guest progress is saved only in this browser and can be lost if you clear its data.</p><div class="account-google"><button class="btn btn-primary" id="googleSignIn" data-auth-provider="google" type="button">Continue with Google</button><p>Recommended · Use your Gmail or Google account. No new password to remember.</p></div><p>Your existing progress stays on this device until you choose to import it.</p><p class="account-note">The course owner can see your name, email and learning activity to improve the course. Your notebook and typed practice briefs stay on this device.</p><div class="account-github"><button class="btn btn-ghost" id="githubSignIn" data-auth-provider="github" type="button">Continue with GitHub</button><p>Prefer GitHub? Use your existing account to save your learning. We request your profile and email only.</p></div><p id="authFeedback" role="status" aria-live="polite">'+esc(authFeedback)+'</p><a href="#/">Keep exploring as a guest →</a>';
  }
  else{
   html+='<p>Signed in as <strong>'+esc(user.email)+'</strong></p><p id="accountStatus" role="status">'+esc(status)+'</p><div class="account-actions"><button class="btn btn-primary" id="syncNow" type="button">Sync now</button><button class="btn btn-ghost" id="accountExport" type="button">Export my learning data</button><button class="btn btn-ghost" id="accountSignOut" type="button">Sign out</button></div>';
   if(guestHasProgress())html+='<div class="account-import"><h2>Bring your guest progress with you?</h2><p>Import completed lessons, quiz results and review cards from this browser. Your notebook stays in its guest workspace. Existing account progress is preserved.</p><button class="btn btn-primary" id="importGuest" type="button">Import guest progress</button><button class="btn btn-ghost" id="dismissImport" type="button">Keep it separate</button></div>';
   html+='<p class="account-note">Learning records include lessons visited, completions, quiz results and estimated active time. Notebook text and typed practice briefs are excluded. Raw activity is kept for 90 days; daily totals and progress remain until account deletion. Your records are private to your account and the course administrator.</p><a href="#/me">See my progress →</a><p><a href="#/admin">Course administration</a> · Restricted to the course owner</p>';
  }
  content.innerHTML=html+'</section>';
  document.querySelectorAll('[data-auth-provider]').forEach(function(b){b.onclick=function(){startOAuth(b.dataset.authProvider);};});
  var syncButton=document.getElementById('syncNow');if(syncButton)syncButton.onclick=function(){sync();flushEvents();};
  var signout=document.getElementById('accountSignOut');if(signout)signout.onclick=async function(){
   signout.disabled=true;await sync();var r=await client.auth.signOut({scope:'local'});if(r.error){notify('Could not sign out. Try again.');signout.disabled=false;return;}await acceptUser(null);renderAccount();
  };
  var im=document.getElementById('importGuest');if(im)im.onclick=function(){api.applyState(core.mergeImport(core.snapshot(api.getState()),core.snapshot(guest)),true);guest={courses:{},notes:guest.notes||{},theme:guest.theme,focus:guest.focus};write('claudelab.guest',guest);localSave();renderAccount();};
  var dismiss=document.getElementById('dismissImport');if(dismiss)dismiss.onclick=function(){flag('claudelab.importDismissed.'+user.id,'1');document.querySelector('.account-import').remove();};
  var exp=document.getElementById('accountExport');if(exp)exp.onclick=async function(){
   var turn=generation,uid=user.id;exp.disabled=true;
   try{
    await sync();await flushEvents();if(turn!==generation)return;
    var progress=core.snapshot(api.getState());
    var raw=await exportRows('learning_events',uid,'occurred_at',turn);
    var totals=await exportRows('learning_daily',uid,'day',turn);if(turn!==generation)return;
    api.download('claude-lab-account.json','application/json',JSON.stringify({progress:progress,events:raw,daily_totals:totals,raw_retention_days:90,row_limit_per_table:10000,possibly_truncated:raw.length===10000||totals.length===10000},null,2));
    notify('Export ready — up to 10,000 records per table.');
   }catch(e){if(turn===generation)notify('Export could not finish. Try again.');}finally{exp.disabled=false;}
  };
 }
 async function exportRows(table,uid,order,turn){
  var out=[];
  for(var offset=0;offset<10000;offset+=500){
   if(turn!==generation)throw Error('Account changed');
   var q=client.from(table).select('*').eq('user_id',uid).order(order,{ascending:false});
   q=table==='learning_events'?q.order('id'):q.order('course').order('lesson');
   var r=await q.range(offset,offset+499).retry(false).abortSignal(AbortSignal.timeout(15000));
   if(r.error)throw r.error;out=out.concat(r.data);if(r.data.length<500)break;
  }return out;
 }
 function isAdminRoute(){return (location.hash||'').replace(/^#\/?/,'').split('?')[0].split('/').filter(Boolean)[0]==='admin';}
 async function renderAdmin(){
  var request=++adminRequest,turn=generation,uid=user&&user.id;
  var content=document.getElementById('content');content.innerHTML='<section class="account-panel"><h1>Learning dashboard</h1><p role="status">Checking administrator access…</p></section>';
  function current(){return isAdminRoute()&&request===adminRequest&&turn===generation&&!!user&&user.id===uid;}
  if(!ready){setTimeout(function(){if(isAdminRoute())renderAdmin();},300);return;}
  if(!user){content.innerHTML='<section class="account-panel"><h1>Course administration</h1><p>Sign in with the course owner account to view learning analytics.</p><a class="btn btn-primary" href="#/account">Sign in</a></section>';return;}
  await window.ADMIN_DASHBOARD.mount(content,{
   isCurrent:current,
   load:function(params){return client.rpc('learning_admin_dashboard',params).retry(false).abortSignal(AbortSignal.timeout(20000));},
   legacy:function(){return client.rpc('learning_admin_report').retry(false).abortSignal(AbortSignal.timeout(15000));},
   guest:async function(days,course){
    var base=window.SITE&&window.SITE.analytics;
    if(!base||!/^https?:\/\/[^/?#]+$/.test(base))throw Error('Collector not configured');
    var session=await client.auth.getSession();if(!current()||session.error||!session.data.session)throw Error('Account changed');
    var url=new URL('/api/report',base);url.searchParams.set('format','json');url.searchParams.set('days',days);if(course)url.searchParams.set('course',course);
    var response=await fetch(url.href,{headers:{Authorization:'Bearer '+session.data.session.access_token},cache:'no-store',signal:AbortSignal.timeout(30000)});
    if(!current()||!response.ok)throw Error('Guest report unavailable');return response.json();
   }
  });
 }
 window.ACCOUNT={init:init,onSave:localSave,sync:sync,recordUsage:usage,record:record,isSignedIn:function(){return !!user;},renderAccount:renderAccount,renderAdmin:renderAdmin,guestPrompt:guestPrompt};
})();
