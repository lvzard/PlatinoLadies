(() => {
  'use strict';
  const ENDPOINT = 'https://lqmwirnifapxctzmkmll.supabase.co/functions/v1/gaestebuch-einreichen';
  const left=document.getElementById('pl-page-left'),right=document.getElementById('pl-page-right');
  const count=document.getElementById('guestbook-count'),progress=document.getElementById('pl-book-progress');
  const prev=document.getElementById('pl-book-prev'),next=document.getElementById('pl-book-next');
  const form=document.getElementById('guestbook-form');
  if(!left||!right||!form)return;
  const hint=form.querySelector('.guestbook-hint');
  const isMobile=()=>window.matchMedia('(max-width:700px)').matches;
  const node=(tag,cls,value)=>{const n=document.createElement(tag);n.className=cls;if(value!==undefined)n.textContent=value;return n;};
  let entries=[],position=0,loadError=false;
  function pages(){return [{kind:'intro'},{kind:'form'},...entries.map(e=>({kind:'entry',entry:e}))];}
  function renderPage(target,page,index){
    target.replaceChildren();target.classList.toggle('pl-page-blank',!page);
    if(!page)return;
    target.append(node('div','pl-page-ornament','✦  ☾  ✦'));
    if(page.kind==='intro'){
      target.append(node('div','pl-book-small','PLATINO LADIES'));
      target.append(node('h3','pl-book-title','Unser Gästebuch'));
      target.append(node('div','pl-book-moon','☽ ✧ ☾'));
      target.append(node('p','pl-book-intro','Jede Begegnung hinterlässt einen Funken Magie. Hier bewahren wir eure lieben Worte und Erinnerungen.'));
      target.append(node('p','pl-book-signature','In Liebe, die Platis ♡'));
    } else if(page.kind==='entry'){
      const e=page.entry;
      target.append(node('div','pl-book-small','✧ EIN LIEBER GRUSS ✧'));
      target.append(node('h3','pl-entry-name',String(e.name).slice(0,70)));
      if(e.club)target.append(node('p','pl-entry-club',String(e.club).slice(0,80)));
      target.append(node('div','pl-book-divider','❧ ✦ ❧'));
      target.append(node('p','pl-entry-message',String(e.message).slice(0,1200)));
      if(e.created_at){const d=new Date(e.created_at);if(!Number.isNaN(d.getTime()))target.append(node('p','pl-entry-date',new Intl.DateTimeFormat('de-DE',{dateStyle:'medium'}).format(d)));}
    } else {
      target.append(node('div','pl-book-small','✒ DEINE SEITE'));
      target.append(node('h3','pl-entry-name','Schreib uns!'));
      target.append(node('p','pl-form-intro','Hinterlasse einen Gruß für die Platino Ladies. Nach Freigabe bekommt er seine eigene Buchseite.'));
      target.append(form);
    }
    target.append(node('div','pl-page-number',String(index+1)));
  }
  function render(){
    const all=pages(),step=isMobile()?1:2;
    position=Math.min(position,Math.max(0,Math.ceil(all.length/step)-1));
    const offset=position*step;
    renderPage(left,all[offset],offset);
    if(isMobile()){right.hidden=true;}else{right.hidden=false;renderPage(right,all[offset+1],offset+1);}
    progress.textContent=`✧ ${position+1} / ${Math.ceil(all.length/step)} ✧`;
    prev.disabled=position===0;next.disabled=position>=Math.ceil(all.length/step)-1;
  }
  prev.addEventListener('click',()=>{position--;render();});
  next.addEventListener('click',()=>{position++;render();});
  window.addEventListener('resize',()=>{position=0;render();});
  async function load(){
    try{
      const res=await fetch(ENDPOINT,{headers:{Accept:'application/json'},cache:'no-store'});
      if(!res.ok)throw new Error('Laden fehlgeschlagen');
      const data=await res.json();if(!Array.isArray(data))throw new Error('Ungültige Antwort');
      entries=data.filter(e=>e&&e.status==='approved'&&typeof e.name==='string'&&typeof e.message==='string').slice(0,100);
      count.textContent=entries.length+' '+(entries.length===1?'Eintrag':'Einträge');
      position=0;render();
    }catch(err){count.textContent='Einträge momentan nicht erreichbar';entries=[];render();}
  }
  form.addEventListener('submit',async e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const btn=form.querySelector('[type=submit]');btn.disabled=true;
    hint.textContent='Nachricht wird übermittelt …';
    try{
      const payload={name:document.getElementById('guestbook-name').value.trim(),club:document.getElementById('guestbook-club').value.trim(),message:document.getElementById('guestbook-message').value.trim()};
      const res=await fetch(ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await res.json();if(!res.ok)throw Error(data.error||'Senden fehlgeschlagen');
      form.reset();hint.textContent='✓ Danke! Dein Eintrag wartet auf die Freigabe durch die Leitung.';
    }catch(err){hint.textContent='Fehler: '+err.message;}finally{btn.disabled=false;}
  });
  render();load();
})();
