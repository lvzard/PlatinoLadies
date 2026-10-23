(()=>{
'use strict';
const ENDPOINT='https://lqmwirnifapxctzmkmll.supabase.co/functions/v1/leitung-zugang';
const KEY='pl_leitung_session';
const gate=document.getElementById('leader-gate'),hub=document.getElementById('leader-hub');
const form=document.getElementById('leader-form'),status=document.getElementById('leader-status');
function showHub(){gate.hidden=true;hub.hidden=false;}
function showGate(){hub.hidden=true;gate.hidden=false;}
async function validate(){
 const token=sessionStorage.getItem(KEY);
 if(!token){showGate();return;}
 try{
  const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'list',token})});
  if(!r.ok)throw Error('Sitzung abgelaufen');
  showHub();
 }catch{sessionStorage.removeItem(KEY);showGate();}
}
form.addEventListener('submit',async e=>{
 e.preventDefault();status.textContent='Zugang wird geprüft …';
 const btn=form.querySelector('button');btn.disabled=true;
 try{
  const r=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',password:document.getElementById('leader-password').value})});
  const data=await r.json();
  if(!r.ok||!data.token)throw Error(data.error||'Anmeldung fehlgeschlagen');
  sessionStorage.setItem(KEY,data.token);
  document.getElementById('leader-password').value='';
  status.textContent='';showHub();
 }catch(err){status.textContent=err.message||'Anmeldung fehlgeschlagen';}
 finally{btn.disabled=false;}
});
document.getElementById('leader-logout').addEventListener('click',()=>{
 sessionStorage.removeItem(KEY);showGate();status.textContent='Abgemeldet.';
});
validate();
})();
