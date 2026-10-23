import {createClient} from 'npm:@supabase/supabase-js@2';
const origin='https://platinoladies.github.io';const headers={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'content-type','Access-Control-Allow-Methods':'GET, POST, OPTIONS','Content-Type':'application/json','Cache-Control':'no-store'};
const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false}});
const reply=(obj:unknown,status=200)=>new Response(JSON.stringify(obj),{status,headers});
const trim=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max+1):'';
Deno.serve(async req=>{
 if(req.method==='OPTIONS')return new Response(null,{headers});
 if(req.method==='GET'){
  const {data,error}=await db.from('gaestebuch_eintraege').select('name,club,message,created_at,status').eq('status','approved').order('created_at',{ascending:false}).limit(100);
  return error?reply({error:'Einträge nicht verfügbar'},500):reply(data);
 }
 if(req.method!=='POST')return reply({error:'Methode nicht erlaubt'},405);
 if(req.headers.get('origin')!==origin)return reply({error:'Herkunft nicht erlaubt'},403);
 try{
  const body=await req.json();const name=trim(body.name,70),club=trim(body.club,80),message=trim(body.message,1200);
  if(!name||name.length>70||club.length>80||!message||message.length>1200)return reply({error:'Bitte gültige Angaben machen.'},400);
  const ip=(req.headers.get('cf-connecting-ip')||req.headers.get('x-forwarded-for')?.split(',')[0]||'unknown').slice(0,100);
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(ip+':'+(Deno.env.get('GAESTEBUCH_RATE_SECRET')||'pl-guestbook')));
  const key=Array.from(new Uint8Array(digest)).map(x=>x.toString(16).padStart(2,'0')).join('');
  const {data:allowed,error:rateError}=await db.rpc('gaestebuch_rate_limit',{p_hash:key});
  if(rateError){console.error(rateError);return reply({error:'Senden derzeit nicht möglich.'},503)}
  if(!allowed)return reply({error:'Bitte warte einige Minuten vor dem nächsten Eintrag.'},429);
  const {error}=await db.from('gaestebuch_eintraege').insert({name,club,message,status:'pending'});
  if(error)throw error;
  const webhook=Deno.env.get('DISCORD_WEBHOOK_URL');if(webhook){try{const r=await fetch(webhook,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:'Platino Ladies | Gästebuch',allowed_mentions:{parse:[]},embeds:[{title:'💌 Neuer Gästebucheintrag',description:'Ein Eintrag wartet auf Freigabe in der Leitungszentrale.',color:10171765,fields:[{name:'Name',value:name},{name:'Club',value:club||'—'}],url:'https://platinoladies.github.io/leitungs-gaestebuch.html',timestamp:new Date().toISOString()}]})});if(!r.ok)console.error('Discord',r.status);}catch(e){console.error(e);}}
  return reply({success:true});
 }catch(e){console.error(e);return reply({error:'Senden fehlgeschlagen.'},500)}
});