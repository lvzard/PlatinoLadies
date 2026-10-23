(()=>{
'use strict';
const ENDPOINT='https://lqmwirnifapxctzmkmll.supabase.co/functions/v1/leitung-zugang', KEY='pl_leitung_session';
const $=id=>document.getElementById(id),login=$('pl-login'),dash=$('pl-dashboard'),status=$('pl-list-status'),list=$('pl-applications');
let token=sessionStorage.getItem(KEY),owner=false,applications=[],filter='alle';
function message(target,msg){target.textContent=msg;}
function elem(tag,txt,cls){const e=document.createElement(tag);if(txt!==undefined)e.textContent=String(txt);if(cls)e.className=cls;return e;}
async function api(action,extra={}){
 const response=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,token,...extra})});
 const data=await response.json().catch(()=>({}));
 if(!response.ok||data.error)throw new Error(data.error||'Anfrage fehlgeschlagen');
 return data;
}
function normalized(s){return String(s||'').toLocaleLowerCase('de-DE');}
function displayStatus(s){return ({neu:'Neu',in_bearbeitung:'In Bearbeitung',angenommen:'Angenommen',abgelehnt:'Abgelehnt'})[s]||s||'Neu';}
function field(dl,label,value){
 dl.append(elem('dt',label),elem('dd',value===null||value===undefined||value===''?'—':typeof value==='object'?JSON.stringify(value):value));
}
function render(){
 const counts={alle:applications.length,neu:0,in_bearbeitung:0,angenommen:0,abgelehnt:0};
 for(const a of applications){const key=a.status||'neu';if(key in counts)counts[key]++;}
 for(const b of document.querySelectorAll('.pl-filter')){
  b.classList.toggle('is-active',b.dataset.filter===filter);
  b.setAttribute('aria-pressed',String(b.dataset.filter===filter));
  b.querySelector('span').textContent=counts[b.dataset.filter]??0;
 }
 const q=normalized($('pl-search').value.trim());
 const selected=applications.filter(a=>(filter==='alle'||(a.status||'neu')===filter)&&(!q||normalized(a.sso_name).includes(q)||normalized(a.discord_name).includes(q)));
 list.replaceChildren();
 message(status,`${selected.length} von ${applications.length} Bewerbung(en) · Neueste zuerst`);
 if(!selected.length){list.append(elem('p','Keine passenden Bewerbungen gefunden.','pl-empty'));return;}
 for(const a of selected){
  const card=elem('article',undefined,'pl-application');
  const details=elem('details',undefined,'pl-details');
  const summary=elem('summary',undefined,'pl-summary');
  const title=elem('span',undefined,'pl-summary-title');
  title.append(elem('strong',a.sso_name||'Ohne Namen'),elem('small',`Discord: ${a.discord_name||'—'} · ${a.created_at?new Date(a.created_at).toLocaleDateString('de-DE'):'Datum unbekannt'}`));
  const pill=elem('span',displayStatus(a.status),'pl-pill pl-pill-'+(a.status||'neu'));
  summary.append(title,pill,elem('span','Details ansehen','pl-expand-label'));
  details.append(summary);
  const content=elem('div',undefined,'pl-detail-content');
  const dl=elem('dl',undefined,'pl-fields');
  field(dl,'Eingereicht',a.created_at?new Date(a.created_at).toLocaleString('de-DE'):'—');
  for(const [key,label] of [['discord_name','Discord'],['instagram','Instagram'],['spielerlevel','Spielerlevel'],['alter','Alter']])field(dl,label,a[key]);
  const labels={uniform:'Uniform',begleiter:'Begleiter',treffen:'Clubtreffen',starrider:'Star Rider',clubs:'Weitere Clubs / Teams',about:'Über mich',extra:'Weitere Nachricht'};
  for(const [k,v] of Object.entries(a.antworten||{}))field(dl,labels[k]||k,v);
  field(dl,'Bearbeitet von',a.bearbeitet_von);
  content.append(dl);
  const notes=elem('div',undefined,'pl-notes'),label=elem('label','✧ Interne Notizen','pl-notes-label'),input=elem('textarea');
  input.value=a.notizen||'';input.maxLength=5000;input.rows=4;
  const actions=elem('div',undefined,'pl-actions'),save=elem('button','Notiz speichern','btn'),feedback=elem('span','');
  save.type='button';
  save.onclick=async()=>{save.disabled=true;message(feedback,'Speichere …');try{await api('note',{id:a.id,note:input.value});a.notizen=input.value;message(feedback,'✓ Gespeichert');}catch(e){message(feedback,'Fehler: '+e.message);}finally{save.disabled=false;}};
  label.append(input);actions.append(save,feedback);notes.append(label,actions);content.append(notes);
  if(owner){
   const buttons=elem('div',undefined,'pl-actions pl-decision-actions');
   for(const [text,value] of [['In Bearbeitung','in_bearbeitung'],['Annehmen','angenommen'],['Ablehnen','abgelehnt']]){
    const b=elem('button',text,'btn');b.type='button';
    b.onclick=async()=>{
     if(value!=='in_bearbeitung'&&!confirm(`Bewerbung wirklich ${text.toLowerCase()}?`))return;
     b.disabled=true;
     try{await api('status',{id:a.id,status:value});await load();}catch(e){alert(e.message);b.disabled=false;}
    };buttons.append(b);
   }content.append(buttons);
  }
  details.append(content);card.append(details);list.append(card);
 }
}
async function load(){
 message(status,'Bewerbungen werden geladen …');
 try{
  const data=await api('list');
  applications=Array.isArray(data.applications)?data.applications:[];
  applications.sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0));
  render();
 }catch(e){
  message(status,'Bewerbungen konnten nicht geladen werden: '+e.message);
  if(/Sitzung abgelaufen|erneut anmelden|401|Ungültig/i.test(e.message)){sessionStorage.removeItem(KEY);token=null;dash.hidden=true;login.hidden=false;}
 }
}
function showDashboard(){login.hidden=true;dash.hidden=false;$('pl-owner').hidden=owner;message($('pl-user-label'),owner?'Lutz · Owner':'Clubleitung');}
$('pl-login-form').onsubmit=async e=>{
 e.preventDefault();message($('pl-login-status'),'Prüfe Zugang …');
 try{
  const result=await api('login',{password:$('pl-password').value});
  token=result.token;owner=false;sessionStorage.setItem(KEY,token);$('pl-password').value='';
  showDashboard();await load();
 }catch(err){message($('pl-login-status'),err.message);}
};
$('pl-owner').onclick=()=>{$('pl-owner-form').hidden=!$('pl-owner-form').hidden;};
$('pl-owner-form').onsubmit=async e=>{
 e.preventDefault();message($('pl-owner-status'),'Prüfe Lutz-Code …');
 try{
  const result=await api('owner',{code:$('pl-owner-code').value});
  token=result.token;owner=true;sessionStorage.setItem(KEY,token);
  $('pl-owner-code').value='';$('pl-owner-form').hidden=true;
  showDashboard();await load();
 }catch(err){message($('pl-owner-status'),err.message);}
};
$('pl-refresh').onclick=load;
$('pl-logout').onclick=()=>{
 token=null;owner=false;sessionStorage.removeItem(KEY);dash.hidden=true;login.hidden=false;
 $('pl-owner-form').hidden=true;list.replaceChildren();message($('pl-login-status'),'Abgemeldet.');
};
for(const b of document.querySelectorAll('.pl-filter'))b.addEventListener('click',()=>{filter=b.dataset.filter;render();});
$('pl-search').addEventListener('input',render);
if(token){
 // Existing session is checked by the server before showing applicant data.
 showDashboard();load();
}
})();
