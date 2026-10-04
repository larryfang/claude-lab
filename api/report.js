import fs from "node:fs";
import path from "node:path";
import { loadCatalog, renderReport, summarize } from "../analytics/report.mjs";
import { readEventStore } from "../analytics/blob-store.mjs";
import { verifyOwner } from "../analytics/admin-auth.mjs";

function openCatalog() {
  const root = process.cwd();
  const snapshot = path.join(root, "analytics/catalog.json");
  try {
    return loadCatalog(root);
  } catch {
    const data = JSON.parse(fs.readFileSync(snapshot, "utf8"));
    const lessons = new Map(data.lessons.map((entry) => [entry.key, entry]));
    lessons.paths = data.paths || [];
    return lessons;
  }
}

const catalog = openCatalog();

const allowedOrigins=new Set(['https://larryfang.github.io','https://claude-lab-usage.vercel.app','http://127.0.0.1:4173','http://127.0.0.1:4174','http://localhost:4173','http://localhost:4174']);

export function createReportHandler({read=readEventStore,owner=verifyOwner,lessons=catalog}={}) {
 return async function report(req,res) {
  const headers={'cache-control':'no-store','x-frame-options':'DENY','referrer-policy':'same-origin','x-content-type-options':'nosniff',vary:'Origin'};
  const origin=req.headers.origin;
  if(origin&&!allowedOrigins.has(origin)){res.writeHead(403,headers);return res.end('Origin not allowed');}
  if(origin)headers['access-control-allow-origin']=origin;
  if(req.method==='OPTIONS'){
   res.writeHead(204,{...headers,'access-control-allow-methods':'GET, HEAD, OPTIONS','access-control-allow-headers':'authorization','access-control-max-age':'600'});return res.end();
  }
  if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405,headers);return res.end('Method not allowed');}
  const url=new URL(req.url||'/', 'https://claude-lab-usage.vercel.app');
  let permitted=false;
  if(req.headers.authorization){
   try{permitted=await owner(req.headers.authorization);}catch{res.writeHead(503,headers);return res.end('Owner verification is temporarily unavailable');}
  }
  if(!permitted){res.writeHead(401,headers);return res.end('Sign in with the course owner account to view this private report.');}
  const days=url.searchParams.has('days')?Number(url.searchParams.get('days')):null,course=url.searchParams.get('course')||'';
  if((days!==null&&![7,30,90].includes(days))||(course&&![...lessons.values()].some(l=>l.course===course))){res.writeHead(400,headers);return res.end('Invalid report filters');}
  let store;
  try{store=await read();}catch{res.writeHead(503,headers);return res.end('The event store is temporarily unavailable');}
  const events=Array.isArray(store)?store:store.events;
  const data=summarize(events,lessons,Date.now(),{days,course});
  data.coverage=store.coverage||{loaded_events:events.length,partial:false};
  const json=url.searchParams.get('format')==='json';
  res.writeHead(200,{...headers,'content-type':json?'application/json; charset=utf-8':'text/html; charset=utf-8'});
  return res.end(req.method==='HEAD'?'':json?JSON.stringify(data):renderReport(data));
 };
}
export default createReportHandler();
