// Öffentlich abrufbarer Status: Edge Function muss {open: boolean} zurückgeben.
(()=>{'use strict';
 const endpoint='https://lqmwirnifapxctzmkmll.supabase.co/functions/v1/bewerbungsstatus';
 const shell=document.querySelector('.application-shell');
 const notice=document.getElementById('pl-intake-notice');
 const form=document.getElementById('magic-application');
 const send=document.getElementById('magic-send');
 const preview=document.getElementById('magic-preview');
 const setOpen=open=>{
  window.PL_APPLICATIONS_OPEN=open;
  if(shell) shell.style.display=open?'':'none';
  if(notice){notice.style.display=open?'none':'block';if(!open) notice.querySelector('h2').textContent='✧ Bewerbungsfach geschlossen ✧';}
  if(form) for(const el of form.querySelectorAll('input,select,textarea,button'))el.disabled=!open;
  if(send)send.disabled=!open;
  if(preview&&!open)preview.hidden=true;
 };
 // Fail closed: Ohne verlässlichen Serverstatus keine Bewerbungen annehmen.
 setOpen(false);
 if(notice){notice.querySelector('h2').textContent='✧ Bewerbungsstatus wird geprüft ✧';notice.querySelector('p').textContent='Bitte einen Moment warten …';}
 fetch(endpoint,{
  cache:'no-store',
  headers:{
    'apikey':'sb_publishable_4vWZiD2xePd7EwFAdTUDAg_lv8KEXKs'
  }
}).then(async r=>{const d=await r.json();if(!r.ok||typeof d.open!=='boolean')throw Error('Status nicht verfügbar');setOpen(d.open);}).catch(()=>{
  if(notice){notice.querySelector('h2').textContent='✧ Bewerbungsfach vorübergehend nicht verfügbar ✧';notice.querySelector('p').textContent='Der Bewerbungsstatus konnte nicht geladen werden. Bitte versuche es später erneut.';}
 });
})();
