(()=>{'use strict';
const API='https://lqmwirnifapxctzmkmll.supabase.co/functions/v1/gaestebuch-admin';
const token=sessionStorage.getItem('pl_leitung_session');
const list=document.getElementById('gb-list'),status=document.getElementById('gb-status'),tabs=document.getElementById('gb-tabs');
let entries=[],filter='pending';
if(!token){status.textContent='Bitte zuerst in der Leitungszentrale anmelden.';return;}
function el(tag,text){const e=document.createElement(tag);e.textContent=text;return e;}
async function call(action,extra={}){const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action,token,...extra})});const d=await r.json();if(!r.ok)throw Error(d.error||'Fehler');return d;}
const labels={pending:'Noch nicht bearbeitet',approved:'Angenommen',rejected:'Abgelehnt'};
function render(){
  for(const btn of tabs.querySelectorAll('[data-status]')){const key=btn.dataset.status;const count=entries.filter(x=>x.status===key).length;btn.querySelector('.gb-count').textContent=count;btn.classList.toggle('gb-active',key===filter);btn.setAttribute('aria-pressed',String(key===filter));}
  const selected=entries.filter(x=>x.status===filter);list.replaceChildren();status.textContent=`${selected.length} ${selected.length===1?'Eintrag':'Einträge'} · ${labels[filter]}`;
  if(!selected.length){list.append(el('p',filter==='pending'?'Alle Einträge sind bearbeitet. ✨':'In diesem Archiv gibt es noch keine Einträge.'));return;}
  for(const item of selected){
    const card=el('article','');card.className='card';card.style.margin='0';
    const heading=el('h3',item.name||'Unbekannt');const club=el('p',item.club||'Ohne Club');const message=el('p',item.message||'');message.style.whiteSpace='pre-wrap';message.style.overflowWrap='anywhere';
    const date=el('small',new Date(item.created_at).toLocaleString('de-DE')+' · '+(labels[item.status]||item.status));
    card.append(heading,club,message,date);
    const actions=el('div','');actions.className='gb-actions';
    const options=item.status==='pending'?[['✓ Annehmen','approve'],['✕ Ablehnen','reject']]:item.status==='approved'?[['↩ Zu offen','reject'],['✕ Ablehnen','reject']]:[['✓ Annehmen','approve']];
    // Zurück zu „offen“ benötigt eine zusätzliche Serveraktion und wird deshalb nicht angeboten.
    const safeOptions=options.filter(([label])=>!label.includes('Zu offen'));
    for(const [label,action] of [...safeOptions,['🗑 Löschen','delete']]){
      const b=el('button',label);b.type='button';b.className='btn';
      b.onclick=async()=>{if(action==='delete'&&!confirm('Diesen Gästebucheintrag dauerhaft löschen?'))return;b.disabled=true;try{await call(action,{id:item.id});await load();}catch(e){alert(e.message);b.disabled=false;}};
      actions.append(b);
    }
    card.append(actions);list.append(card);
  }
}
async function load(){try{status.textContent='Einträge werden geladen …';const data=await call('list');entries=data.entries||[];render();}catch(e){status.textContent='Fehler: '+e.message;}}
for(const btn of tabs.querySelectorAll('[data-status]'))btn.addEventListener('click',()=>{filter=btn.dataset.status;render();});
load();
})();
