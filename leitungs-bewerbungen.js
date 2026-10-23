(()=>{'use strict';
const URL='https://lqmwirnifapxctzmkmll.supabase.co', KEY='sb_publishable_4vWZiD2xePd7EwFAdTUDAg_lv8KEXKs';
const login=document.getElementById('pl-login'),dash=document.getElementById('pl-dashboard'),loginForm=document.getElementById('pl-login-form'),loginStatus=document.getElementById('pl-login-status'),listStatus=document.getElementById('pl-list-status'),list=document.getElementById('pl-applications'),userLabel=document.getElementById('pl-user-label');
if(!window.supabase){loginStatus.textContent='Die Anmeldebibliothek konnte nicht geladen werden. Bitte Internetverbindung prüfen.';return;}
const client=window.supabase.createClient(URL,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
let role=null;
function status(el,msg,error=false){el.textContent=msg;el.dataset.error=String(error);}
function el(tag,txt,cls){const x=document.createElement(tag);if(txt!==undefined)x.textContent=String(txt);if(cls)x.className=cls;return x;}
function addField(dl,label,value){dl.append(el('dt',label),el('dd',value==null||value===''?'—':typeof value==='object'?JSON.stringify(value):value));}
async function load(){status(listStatus,'Bewerbungen werden geladen …');list.replaceChildren();const {data,error}=await client.from('bewerbungen').select('id,created_at,sso_name,discord_name,instagram,spielerlevel,alter,antworten,status,bearbeitet_von,notizen').order('created_at',{ascending:false});if(error){status(listStatus,'Bewerbungen konnten nicht geladen werden: '+error.message,true);return;}status(listStatus,`${data.length} Bewerbung(en)`);for(const a of data){const card=el('article',undefined,'pl-application');const title=el('h3',a.sso_name||'Ohne Namen');card.append(title,el('span',a.status||'neu','pl-pill'));const dl=el('dl');addField(dl,'Eingereicht',a.created_at?new Date(a.created_at).toLocaleString('de-DE'):'—');addField(dl,'Discord',a.discord_name);addField(dl,'Instagram',a.instagram);addField(dl,'Spielerlevel',a.spielerlevel);addField(dl,'Alter',a.alter);const labels={uniform:'Uniform',begleiter:'Begleiter',treffen:'Clubtreffen',starrider:'Star Rider',clubs:'Weitere Clubs / Teams',about:'Über mich',extra:'Weitere Nachricht'};for(const [k,v] of Object.entries(a.antworten||{}))addField(dl,labels[k]||k,v);addField(dl,'Bearbeitet von',a.bearbeitet_von);card.append(dl);
// Notizen werden ausschließlich über eine serverseitig autorisierte RPC gespeichert.
const noteBox=el('div',undefined,'pl-notes');
const noteLabel=el('label','✧ Interne Notizen','pl-notes-label');
const noteInput=el('textarea');noteInput.rows=4;noteInput.maxLength=5000;
noteInput.value=a.notizen||'';noteInput.setAttribute('aria-label','Interne Notizen für '+(a.sso_name||'Bewerbung'));
const noteActions=el('div',undefined,'pl-actions');
const saveNote=el('button','Notiz speichern','btn');saveNote.type='button';
const noteStatus=el('span','','pl-note-status');noteStatus.setAttribute('role','status');
saveNote.addEventListener('click',async()=>{
  saveNote.disabled=true;noteStatus.textContent='Notiz wird gespeichert …';
  const {error}=await client.rpc('leitung_notiz_speichern',{p_bewerbung_id:a.id,p_notiz:noteInput.value});
  if(error){noteStatus.textContent='Fehler: '+error.message;noteStatus.dataset.error='true';saveNote.disabled=false;return;}
  a.notizen=noteInput.value;noteStatus.textContent='✓ Notiz gespeichert';noteStatus.dataset.error='false';saveNote.disabled=false;
});
noteLabel.append(noteInput);noteActions.append(saveNote,noteStatus);noteBox.append(noteLabel,noteActions);card.append(noteBox);if(role==='owner'){const actions=el('div',undefined,'pl-actions');for(const [label,value] of [['In Bearbeitung','in_bearbeitung'],['Annehmen','angenommen'],['Ablehnen','abgelehnt']]){const b=el('button',label,'btn');b.type='button';b.addEventListener('click',async()=>{if((value==='angenommen'||value==='abgelehnt')&&!confirm(`Bewerbung von ${a.sso_name} wirklich ${label.toLowerCase()}?`))return;b.disabled=true;const {error}=await client.from('bewerbungen').update({status:value,bearbeitet_von:'Lutz'}).eq('id',a.id);if(error){alert('Änderung nicht gespeichert: '+error.message);b.disabled=false;return;}await load();});actions.append(b);}card.append(actions);}list.append(card);}}
async function refresh(){const {data:{user},error}=await client.auth.getUser();if(error||!user){login.hidden=false;dash.hidden=true;return;}const {data:allowed,error:checkError}=await client.rpc('leitungsprofil');if(checkError||!allowed||!allowed.length){await client.auth.signOut();login.hidden=false;dash.hidden=true;status(loginStatus,'Dieser Account hat keine Leitungsberechtigung.',true);return;}role=allowed[0].rolle;userLabel.textContent=allowed[0].name+' · '+role;
login.hidden=true;dash.hidden=false;await load();}
loginForm.addEventListener('submit',async e=>{e.preventDefault();status(loginStatus,'Anmeldung läuft …');const {error}=await client.auth.signInWithPassword({email:document.getElementById('pl-email').value.trim(),password:document.getElementById('pl-password').value});document.getElementById('pl-password').value='';if(error){status(loginStatus,'Anmeldung fehlgeschlagen: '+error.message,true);return;}await refresh();});
document.getElementById('pl-refresh').addEventListener('click',load);
document.getElementById('pl-logout').addEventListener('click',async()=>{await client.auth.signOut();role=null;dash.hidden=true;login.hidden=false;status(loginStatus,'Du bist abgemeldet.');});
refresh().catch(e=>status(loginStatus,'Verbindung fehlgeschlagen: '+e.message,true));
})();