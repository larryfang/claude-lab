/* Verify a JWT against the single pinned Supabase owner account; no service key. */
import '../assets/js/cloud-config.js';
export async function verifyOwner(authorization, request=fetch) {
 if(typeof authorization!=='string'||!/^Bearer [A-Za-z0-9._-]{20,8192}$/.test(authorization))return false;
 const config=globalThis.CLAUDELAB_CLOUD;
 const response=await request(config.url+'/rest/v1/rpc/learning_admin_access',{
  method:'POST',headers:{apikey:config.publishableKey,Authorization:authorization,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(10000)
 });
 if(response.status===401||response.status===403)return false;
 if(!response.ok)throw Error('Owner verification unavailable');
 return await response.json()===true;
}
