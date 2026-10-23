import {createClient} from 'npm:@supabase/supabase-js@2';
const origin='https://lvzard.github.io';
const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const encoder=new TextEncoder();
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
function answer(data:unknown,status=200){return new Response(JSON.stringify(data),{status,headers});}
function b64(bytes:Uint8Array){return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
function unb64(s:string){const raw=atob(s.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,c=>c.charCodeAt(0));}
async function mac(input:string){const key=await crypto.subtle.importKey('raw',encoder.encode(Deno.env.get('LEITUNG_SESSION_SECRET')!),{name:'HMAC',hash:'SHA-256'},false,['sign']);return b64(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(input))));}
async function makeToken(role:string){const body=b64(encoder.encode(JSON.stringify({role,exp:Date.now()+60*60*1000})));return body+'.'+await mac(body);}
async function verify(token:unknown){if(typeof token!=='string'||token.length>2000)return null;const [body,sig]=token.split('.');if(!body||!sig)return null;const expected=await mac(body);if(sig.length!==expected.length)return null;let diff=0;for(let i=0;i<sig.length;i++)diff|=sig.charCodeAt(i)^expected.charCodeAt(i);if(diff!==0)return null;try{const data=JSON.parse(new TextDecoder().decode(unb64(body)));return data.exp>Date.now()&&['leader','owner'].includes(data.role)?data.role:null;}catch{return null;}}
async function matches(a:string,b:string){const x=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(a)));const y=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(b)));let diff=0;for(let i=0;i<x.length;i++)diff|=x[i]^y[i];return diff===0;}
Deno.serve(async req=>{
if(req.method==='OPTIONS')return new Response(null,{headers});
if(req.method!=='POST')return answer({error:'Methode nicht erlaubt'},405);
if(req.headers.get('origin')!==origin)return answer({error:'Herkunft nicht erlaubt'},403);
try{
const body=await req.json();const action=String(body.action||'');
if(['login','owner'].includes(action)){
  const ip=(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown').slice(0,100);
  const {data:allowed,error:limitError}=await db.rpc('leitung_login_versuch',{p_ip:ip});
  if(limitError)return answer({error:'Anmeldung momentan nicht verfügbar.'},503);
  if(!allowed)return answer({error:'Zu viele Versuche. Bitte später erneut versuchen.'},429);
  if(action==='login'){
    const pass=Deno.env.get('LEITUNG_PASSWORT');if(!pass)return answer({error:'Server nicht eingerichtet.'},503);
    if(typeof body.password!=='string'||!(await matches(body.password,pass)))return answer({error:'Passwort nicht korrekt.'},401);
    return answer({token:await makeToken('leader')});
  }
  if(await verify(body.token)!=='leader')return answer({error:'Bitte zuerst als Clubleitung anmelden.'},401);
  const code=Deno.env.get('LUTZ_ZUSATZCODE');if(!code)return answer({error:'Server nicht eingerichtet.'},503);
  if(typeof body.code!=='string'||!(await matches(body.code,code)))return answer({error:'Zusatzcode nicht korrekt.'},401);
  return answer({token:await makeToken('owner')});
}
const role=await verify(body.token);if(!role)return answer({error:'Sitzung abgelaufen. Bitte erneut anmelden.'},401);
if(action==='list'){
  const {data,error}=await db.from('bewerbungen').select('id,created_at,sso_name,discord_name,instagram,spielerlevel,alter,antworten,status,bearbeitet_von,notizen').order('created_at',{ascending:false}).limit(200);
  if(error)throw error;return answer({applications:data});
}
const id=Number(body.id);if(!Number.isSafeInteger(id)||id<1)return answer({error:'Ungültige Bewerbungs-ID'},400);
if(action==='note'){
  if(typeof body.note!=='string'||body.note.length>5000)return answer({error:'Notiz zu lang.'},400);
  const {error}=await db.from('bewerbungen').update({notizen:body.note,bearbeitet_von:role==='owner'?'Lutz':'Clubleitung'}).eq('id',id);
  if(error)throw error;return answer({success:true});
}
if(action==='status'){
  if(role!=='owner')return answer({error:'Nur Lutz darf den Status ändern.'},403);
  if(!['in_bearbeitung','angenommen','abgelehnt'].includes(body.status))return answer({error:'Ungültiger Status'},400);
  const {error}=await db.from('bewerbungen').update({status:body.status,bearbeitet_von:'Lutz'}).eq('id',id);
  if(error)throw error;return answer({success:true});
}
return answer({error:'Unbekannte Aktion'},400);
}catch(e){console.error(e);return answer({error:'Serverfehler. Bitte später erneut versuchen.'},500);}
});