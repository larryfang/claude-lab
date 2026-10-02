/* Supabase accounts, private progress sync, and bounded learning events. */
(function(){
 'use strict';
 var config=window.CLAUDELAB_CLOUD, core=window.CLOUD_STATE, api, user=null, client=null, ready=false;
 var base={},revision=0,syncing=false,timer=null,generation=0,status='Progress saved on this device',authFeedback='';
 var guest=null,events=[],eventTimer=null,sessionId=crypto.randomUUID(),lastInput=Date.now(),lastPulse=Date.now();
 function copy(v){return JSON.parse(JSON.stringify(v));}
 function read(k,f){try{return JSON.parse(localStorage.getItem(k))||f;}catch(e){return f;}}
 function write(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
 function esc(v){return String(v||'').replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
 function flag(k,v){try{if(v===null)localStorage.removeItem(k);else localStorage.setItem(k,v);}catch(e){}}
 function cacheKey(id){return 'claudelab.account.'+id;}
 function notify(message){status=message;var el=document.getElementById('accountStatus');if(el)el.textContent=message;var b=document.getElementById('accountBtn');if(b){b.setAttribute('aria-label',user?'Your account — '+message:'Sign in to save progress');b.title=user?message:'Sign in to save progress';b.querySelector('span').textContent=user?'Account':'Sign in';}}
 function localSave(){
  if(!api)return;
  if(user){write(cacheKey(user.id),{state:api.getState(),base:base,revision:revision});notify('Changes waiting to sync');schedule();}
  else{guest=copy(api.getState());write('claudelab.guest',guest);}
 }
 function schedule(){clearTimeout(timer);if(user)timer=setTimeout(sync,700);}
 async function remoteState(){var r=await client.from('learner_state').select('state,revision').eq('user_id',user.id).maybeSingle().retry(false).abortSignal(AbortSignal.timeout(15000));if(r.error)throw r.error;return r.data||{state:{},revision:0};}
 async function sync(){
  if(!user)return;if(!navigator.onLine){notify('Saved on this device — sync needs a connection');return;}if(syncing){schedule();return;}syncing=true;var turn=generation,uid=user.id;
  var current=core.snapshot(api.getState()),changes=core.diff(base,current);
  try{
   var r=await remoteState();
   if(turn!==generation)return;
   if(!changes.length){
    base=r.state;revision=r.revision;
    var after=core.diff(current,core.snapshot(api.getState())),pulled=core.apply(base,after);
    if(JSON.stringify(pulled)!==JSON.stringify(core.snapshot(api.getState())))api.applyState(pulled,true);
    write(cacheKey(uid),{state:api.getState(),base:base,revision:revision});notify('Progress synced');if(after.length)schedule();return;
   }
   for(var attempt=0;attempt<4;attempt++){
    if(turn!==generation)return;
    var merged=core.apply(r.state,changes),result=await client.rpc('save_learning_state',{expected_revision:r.revision,body:merged}).retry(false).abortSignal(AbortSignal.timeout(15000));
    if(turn!==generation)return;
    if(result.error){if(result.error.code==='PT409'){r=await remoteState();continue;}throw result.error;}
    var later=core.diff(current,core.snapshot(api.getState()));base=result.data.state;revision=result.data.revision;
    var next=core.apply(base,later);
    // Only rerender for a real remote change; ordinary background saves leave exercises intact.
    if(JSON.stringify(next)!==JSON.stringify(core.snapshot(api.getState())))api.applyState(next,true);
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
  user=next;events=[];
  if(!next){flag('claudelab.accountOwner',null);base={};revision=0;api.applyState(read('claudelab.guest',{courses:{}}),false);notify('Progress saved on this device');return;}
  var turn=generation,cached=read(cacheKey(next.id),null);events=read('claudelab.events.'+next.id,[]);
  try{
   var remote=await remoteState();if(turn!==generation)return;
   var local=cached?core.snapshot(cached.state):remote.state;
   var pending=cached?core.diff(cached.base||{},local):[];
   base=remote.state;revision=remote.revision;
   api.applyState(Object.assign(core.apply(remote.state,pending),{notes:cached&&cached.state.notes||{}}),false);
   flag('claudelab.accountOwner',next.id);
   write(cacheKey(next.id),{state:api.getState(),base:base,revision:revision});notify(pending.length?'Changes waiting to sync':'Progress synced');
   if(pending.length)schedule();record({type:'view'});flushEvents();
  }catch(e){
   if(turn!==generation)return;
   base=cached&&cached.base||{};revision=cached&&cached.revision||0;
   api.applyState(cached?cached.state:{courses:{}},false);flag('claudelab.accountOwner',next.id);notify('Saved on this device — sync needs a connection');
  }
  if(location.hash==='#/account')renderAccount();
 }
 async function init(adapter){
  api=adapter;guest=read('claudelab.guest',copy(api.getState()));
  if(!config||!config.url||!config.publishableKey){ready=true;return;}
  client=window.supabase.createClient(config.url,config.publishableKey,{auth:{flowType:'pkce',detectSessionInUrl:false,persistSession:true,autoRefreshToken:true}});
  client.auth.onAuthStateChange(function(event,session){
   if(event==='SIGNED_OUT')setTimeout(function(){acceptUser(null);},0);
   else if(ready && (event==='SIGNED_IN'||event==='USER_UPDATED'))setTimeout(function(){verifySession(session);},0);
  });
  try{
   var callback=new URL(location.href),code=callback.searchParams.get('code');
   var hashParams=new URLSearchParams(callback.hash.slice(1));
   var callbackError=callback.searchParams.get('error')||hashParams.get('error');
   if(code||callbackError){
    // Remove provider details and authorization codes before rendering or exchanging.
    ['code','error','error_code','error_description','sb'].forEach(function(k){callback.searchParams.delete(k);});
    callback.hash='#/account';history.replaceState(null,'',callback.pathname+callback.search+callback.hash);
    if(callbackError){authFeedback=callbackError==='access_denied'?'Google sign-in was cancelled. You can try again or continue as a guest.':'Google sign-in could not finish. Please try again or continue as a guest.';throw Error('OAuth callback failed');}
    var exchanged=await client.auth.exchangeCodeForSession(code);if(exchanged.error)throw exchanged.error;
   }
   var s=await client.auth.getSession();if(s.error)throw s.error;await verifySession(s.data.session);
  }catch(e){if(!authFeedback)authFeedback='Sign-in could not finish. Please try again or continue as a guest.';notify('Sign-in could not finish. Open your account to retry.');}
  ready=true;if(location.hash==='#/account')api.refresh();
  window.addEventListener('online',function(){sync();flushEvents();});
  ['pointerdown','keydown','scroll'].forEach(function(k){document.addEventListener(k,function(){lastInput=Date.now();},{passive:true});});
  document.addEventListener('visibilitychange',function(){lastPulse=Date.now();if(document.hidden){sync();flushEvents();}});
  setInterval(function(){
   var now=Date.now(),seconds=Math.min(60,Math.floor((now-lastPulse)/1000));lastPulse=now;
   if(user && !document.hidden && now-lastInput<120000 && document.body.dataset.view==='lesson')record({type:'heartbeat',active_seconds:seconds});
  },30000);
 }
 async function verifySession(session){
  if(!session){if(user)await acceptUser(null);return;}
  var r=await client.auth.getUser();if(r.error)throw r.error;await acceptUser(r.data.user);
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
 function guestHasProgress(){return user && !read('claudelab.importDismissed.'+user.id,false) && guest && Object.values(guest.courses||{}).some(function(c){return Object.keys(c.completed||{}).length||Object.keys(c.quiz||{}).length||Object.keys(c.ex||{}).length;});}
 function renderAccount(){
  var content=document.getElementById('content');if(!api||!content)return;
  var html='<section class="account-panel"><span class="micro-label">YOUR LEARNING ACCOUNT</span><h1>'+ (user?'Pick up where you left off.':'Save your learning. Keep your momentum.')+'</h1>';
  if(!ready)html+='<p role="status">Checking your account…</p>';
  else if(!user){html+='<p>Sign in to keep course progress across devices and resume your last lesson. Your existing progress stays on this device until you choose to import it.</p><button class="btn btn-primary" id="googleSignIn" type="button">Continue with Google</button><p id="authFeedback" role="status">'+esc(authFeedback)+'</p><p class="account-note">The course owner can see your name, email and learning activity to improve the course. Your notebook and typed practice briefs stay on this device.</p><a href="#/">Keep exploring as a guest →</a>';}
  else{
   html+='<p>Signed in as <strong>'+esc(user.email)+'</strong></p><p id="accountStatus" role="status">'+esc(status)+'</p><div class="account-actions"><button class="btn btn-primary" id="syncNow" type="button">Sync now</button><button class="btn btn-ghost" id="accountExport" type="button">Export my learning data</button><button class="btn btn-ghost" id="accountSignOut" type="button">Sign out</button></div>';
   if(guestHasProgress())html+='<div class="account-import"><h2>Bring your guest progress with you?</h2><p>Import completed lessons, quiz results and review cards from this browser. Your notebook stays in its guest workspace. Existing account progress is preserved.</p><button class="btn btn-primary" id="importGuest" type="button">Import guest progress</button><button class="btn btn-ghost" id="dismissImport" type="button">Keep it separate</button></div>';
   html+='<p class="account-note">Learning records include lessons visited, completions, quiz results and estimated active time. Notebook text and typed practice briefs are excluded. Raw activity is kept for 90 days; daily totals and progress remain until account deletion. Your records are private to your account and the course administrator.</p><a href="#/me">See my progress →</a><p><a href="#/admin">Course administration</a> · Restricted to the course owner</p>';
  }
  content.innerHTML=html+'</section>';
  var login=document.getElementById('googleSignIn');if(login)login.onclick=async function(){
   var feedback=document.getElementById('authFeedback');login.disabled=true;
   if(location.protocol==='file:'){feedback.textContent='Open the published site to sign in securely.';login.disabled=false;return;}
   try{var redirect=location.origin+location.pathname;var r=await client.auth.signInWithOAuth({provider:'google',options:{redirectTo:redirect,scopes:'openid email profile'}});if(r.error)throw r.error;}
   catch(e){feedback.textContent='Could not start Google sign-in. Please try again.';login.disabled=false;}
  };
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
 function lessonHref(last){return last&&last.c&&last.l?'#/'+encodeURIComponent(last.c)+'/'+encodeURIComponent(last.l)+(last.p?'?path='+encodeURIComponent(last.p):''):'#/';}
 async function renderAdmin(){
  var content=document.getElementById('content');content.innerHTML='<section class="account-panel"><h1>Learning dashboard</h1><p role="status">Checking administrator access…</p></section>';
  if(!ready){setTimeout(function(){if(location.hash==='#/admin')renderAdmin();},300);return;}
  if(!user){content.innerHTML='<section class="account-panel"><h1>Course administration</h1><p>Sign in with the course owner account to view learning analytics.</p><a class="btn btn-primary" href="#/account">Sign in</a></section>';return;}
  var r=await client.rpc('learning_admin_report');if(location.hash!=='#/admin')return;
  if(r.error){var denied=r.error.code==='42501';content.innerHTML='<section class="account-panel"><h1>Course administration</h1><p>'+(denied?'This dashboard requires the course owner account. Learners can view their own progress.':'The dashboard could not load. Check your connection and try again.')+'</p><a href="#/me">My progress →</a>'+(!denied?'<button class="btn btn-ghost" id="retryAdmin" type="button">Try again</button>':'')+'</section>';var retry=document.getElementById('retryAdmin');if(retry)retry.onclick=renderAdmin;return;}
  var d=r.data,s=d.summary;
  content.innerHTML='<section class="admin-page"><span class="micro-label">PRIVATE COURSE ANALYTICS</span><h1>See where learning pauses.</h1><p>Last activity shows where a learner was seen. “Likely paused” means an unfinished selected route or course with no recorded activity for 7 days. Active time is an estimate based on visible, recently active tabs.</p><div class="admin-stats">'+[[s.learners,'learners'],[s.active_7_days,'active in 7 days'],[Math.round(s.active_seconds_30_days/60),'active minutes · 30 days'],[s.events_30_days,'events · 30 days']].map(function(x){return '<div><strong>'+x[0]+'</strong><span>'+esc(x[1])+'</span></div>';}).join('')+'</div><button class="btn btn-ghost" id="refreshAdmin" type="button">Refresh dashboard</button><h2>Learner journeys</h2><p>Showing up to '+s.learner_limit+' learners, most recently active first.</p><div class="admin-table" tabindex="0" role="region" aria-label="Learner journeys"><table><thead><tr><th>Learner</th><th>Last lesson</th><th>Completed</th><th>Quiz accuracy</th><th>Last seen</th><th>Status</th></tr></thead><tbody>'+d.learners.map(function(u){var last=u.last_lesson,c=window.COURSES.find(function(c){return last&&c.id===last.c;}),lesson=c&&c.modules.flatMap(function(m){return m.lessons;}).find(function(l){return l.id===last.l;});return '<tr><td><strong>'+esc(u.display_name)+'</strong><small>'+esc(u.email)+'</small></td><td><a href="'+lessonHref(last)+'">'+esc(lesson?lesson.title:'Not started')+'</a></td><td>'+u.completed_lessons+'</td><td>'+(u.quiz_attempts?Math.round(100*u.quiz_correct/u.quiz_attempts)+'%':'—')+'</td><td>'+esc(u.last_seen?new Date(u.last_seen).toLocaleString():'No activity yet')+'</td><td>'+({not_started:'Not started',completed:'Selected route complete',paused:'Likely paused',active:'Recently active'}[u.learning_status]||'Not started')+'</td></tr>';}).join('')+'</tbody></table></div><h2>Lesson funnel</h2><div class="admin-table" tabindex="0" role="region" aria-label="Lesson funnel"><table><thead><tr><th>Lesson</th><th>Opened</th><th>Currently completed</th><th>Quiz accuracy</th></tr></thead><tbody>'+d.lessons.filter(function(l){return l.learners_started||l.learners_completed||l.quiz_attempts;}).map(function(l){return '<tr><td>'+esc(l.title)+'</td><td>'+l.learners_started+'</td><td>'+l.learners_completed+'</td><td>'+(l.quiz_attempts?Math.round(100*l.quiz_correct/l.quiz_attempts)+'%':'—')+'</td></tr>';}).join('')+'</tbody></table></div><p class="account-note">Quizzes and completions record course activity; they do not certify real-world competence. Guest visits remain in the separate anonymous report. Raw activity is retained for 90 days; daily totals preserve trends. Database size: '+Math.round(s.database_bytes/1024/1024)+' MB of the 500 MB free allowance.</p></section>';
  document.getElementById('refreshAdmin').onclick=renderAdmin;
 }
 window.ACCOUNT={init:init,onSave:localSave,sync:sync,recordUsage:usage,record:record,isSignedIn:function(){return !!user;},renderAccount:renderAccount,renderAdmin:renderAdmin};
})();
