/* State synchronization primitives. Notes and entered briefs are never uploaded. */
(function (root) {
 'use strict';
 var forbidden = ['__proto__', 'constructor', 'prototype'];
 function clone(v) { return JSON.parse(JSON.stringify(v)); }
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
   to.quiz=Object.assign({},from.quiz||{},to.quiz||{});
  });
  ['cards','activity','daily'].forEach(function(k){out[k]=Object.assign({},local[k]||{},out[k]||{});});
  if(!out.last && local.last)out.last=clone(local.last);
  if(!out.learning && local.learning)out.learning=clone(local.learning);
  return out;
 }
 var api={snapshot:snapshot,diff:diff,apply:apply,mergeImport:mergeImport};
 if(typeof module!=='undefined' && module.exports)module.exports=api;else root.CLOUD_STATE=api;
})(typeof window==='undefined'?globalThis:window);
