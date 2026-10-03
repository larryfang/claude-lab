/* State synchronization primitives. Notes and entered briefs are never uploaded. */
(function (root) {
 'use strict';
 var forbidden = ['__proto__', 'constructor', 'prototype'];
 function clone(v) { return JSON.parse(JSON.stringify(v)); }
 function object(v) { return !!v && typeof v==='object' && !Array.isArray(v); }
 // Validate before replacing a workspace. An invalid backup must not destroy it.
 function validState(s) {
  if(!object(s)||!object(s.courses))return false;
  function safe(v){return !v||typeof v!=='object'||Object.keys(v).every(function(k){return forbidden.indexOf(k)<0&&safe(v[k]);});}
  function entries(v,check){return object(v)&&Object.keys(v).every(function(k){return check(v[k],k);});}
  function optional(v,k,check){return v[k]===undefined||check(v[k]);}
  function text(v){return typeof v==='string';}
  function number(v){return typeof v==='number'&&Number.isFinite(v)&&v>=0;}
  function score(v){return object(v)&&number(v.c)&&number(v.t)&&v.c<=v.t;}
  if(!safe(s))return false;
  if(!entries(s.courses,function(c){return object(c)&&['completed','checks','collapsed','ex'].every(function(k){return optional(c,k,function(m){return entries(m,function(v){return typeof v==='boolean'||v===0||v===1;});});})&&optional(c,'quiz',function(m){return entries(m,score);})&&optional(c,'doneAt',text);}))return false;
  if(!optional(s,'cards',function(m){return entries(m,function(c){return object(c)&&text(c.f)&&text(c.b)&&optional(c,'box',function(v){return Number.isInteger(v)&&v>=1&&v<=5;})&&optional(c,'due',text)&&optional(c,'seen',number)&&optional(c,'c',text)&&optional(c,'l',text);});}))return false;
  if(!optional(s,'notes',function(m){return entries(m,function(n){return object(n)&&text(n.a)&&optional(n,'q',text)&&optional(n,'c',text)&&optional(n,'l',text)&&optional(n,'t',number);});}))return false;
  if(!optional(s,'activity',function(m){return entries(m,function(v,k){return number(v)&&/^\d{4}-\d{2}-\d{2}$/.test(k);});})||!optional(s,'daily',function(m){return entries(m,score);}))return false;
  if(!optional(s,'last',function(v){return object(v)&&text(v.c)&&text(v.l)&&optional(v,'p',text)&&optional(v,'s',text)&&optional(v,'t',number);})||!optional(s,'learning',function(v){return object(v)&&optional(v,'goal',text)&&optional(v,'minutes',number);}))return false;
  return optional(s,'name',text)&&optional(s,'focus',function(v){return typeof v==='boolean';})&&optional(s,'theme',function(v){return v===null||v==='light'||v==='dark';});
 }
 function snapshot(s) {
  var out = {};
  ['courses','cards','activity','last','learning','daily'].forEach(function(k){ if(s[k] !== undefined) out[k]=clone(s[k]); });
  return out;
 }
 function diff(a,b,path,out) {
  path=path||[];out=out||[];
  if(JSON.stringify(a)===JSON.stringify(b))return out;
  if(b && typeof b==='object' && !Array.isArray(b) && (a===undefined || (a && typeof a==='object' && !Array.isArray(a)))) {
   a=a||{};
   Array.from(new Set(Object.keys(a).concat(Object.keys(b)))).forEach(function(k){if(forbidden.indexOf(k)<0)diff(a[k],b[k],path.concat(k),out);});
  } else out.push({path:path,value:b===undefined?null:clone(b),remove:b===undefined});
  return out;
 }
 function apply(state,changes) {
  var out=clone(state);
  changes.forEach(function(c){
   if(c.path.some(function(k){return forbidden.indexOf(k)>=0;}))throw Error('Invalid state path');
   if(!c.path.length){out=c.remove?{}:clone(c.value);return;}
   var cur=out;
   c.path.slice(0,-1).forEach(function(k){if(!cur[k]||typeof cur[k]!=='object'||Array.isArray(cur[k]))cur[k]={};cur=cur[k];});
   var key=c.path[c.path.length-1];if(c.remove)delete cur[key];else cur[key]=clone(c.value);
  });return out;
 }
 function mergeImport(remote,local) {
  var out=clone(remote);out.courses=out.courses||{};
  Object.keys(local.courses||{}).forEach(function(c){
   var from=local.courses[c],to=out.courses[c]=out.courses[c]||{};
   ['completed','checks','ex'].forEach(function(k){to[k]=to[k]||{};Object.keys(from[k]||{}).forEach(function(id){if(from[k][id])to[k][id]=from[k][id];});});
   var prior=to.quiz||{};to.quiz=Object.assign({},from.quiz||{},prior);
   Object.keys(from.quiz||{}).forEach(function(id){var a=prior[id],b=from.quiz[id];if(a&&b&&a.t===b.t&&b.c>a.c)to.quiz[id]=clone(b);});
  });
  ['cards','activity','daily'].forEach(function(k){out[k]=Object.assign({},local[k]||{},out[k]||{});});
  if(!out.last && local.last)out.last=clone(local.last);
  if(!out.learning && local.learning)out.learning=clone(local.learning);
  return out;
 }
 var api={snapshot:snapshot,diff:diff,apply:apply,mergeImport:mergeImport,validState:validState};
 if(typeof module!=='undefined' && module.exports)module.exports=api;else root.CLOUD_STATE=api;
})(typeof window==='undefined'?globalThis:window);
