/* Gästebuch: only published entries from a future trusted read-only API.
   Do not expose Discord webhooks, bot tokens or admin credentials in GitHub Pages. */
(() => {
  'use strict';
  // Configure this URL after deploying a secure backend. Until then the empty state is shown.
  const PUBLIC_ENTRIES_ENDPOINT = 'https://lqmwirnifapxctzmkmll.supabase.co/functions/v1/gaestebuch';
  const list = document.getElementById('guestbook-entries');
  const count = document.getElementById('guestbook-count');
  if (!list || !count || !PUBLIC_ENTRIES_ENDPOINT) return;
  const emptyMarkup = list.innerHTML;
  const text = (tag, cls, value) => { const el = document.createElement(tag); el.className = cls; el.textContent = value; return el; };
  async function loadEntries() {
    try {
      const response = await fetch(PUBLIC_ENTRIES_ENDPOINT, {headers: {Accept:'application/json'}, cache:'no-store'});
      if (!response.ok) throw new Error('Einträge konnten nicht geladen werden');
      const data = await response.json();
      if (!Array.isArray(data)) throw new Error('Ungültiges Antwortformat');
      // Defense in depth: public endpoint must already filter approved records server-side.
      const approved = data.filter(e => e && e.status === 'approved' && typeof e.name === 'string' && typeof e.message === 'string').slice(0, 100);
      list.replaceChildren();
      count.textContent = `${approved.length} ${approved.length === 1 ? 'Eintrag' : 'Einträge'}`;
      if (!approved.length) { list.innerHTML = emptyMarkup; return; }
      for (const entry of approved) {
        const card = document.createElement('article'); card.className = 'guestbook-entry';
        const head = document.createElement('div'); head.className = 'guestbook-entry-header';
        const who = document.createElement('div');
        who.append(text('div','guestbook-entry-name',entry.name.slice(0,70)));
        if (entry.club) who.append(text('div','guestbook-entry-club',String(entry.club).slice(0,80)));
        head.append(who, text('span','guestbook-entry-spark','✧'));
        card.append(head, text('p','guestbook-entry-message',entry.message.slice(0,1200)));
        if (entry.created_at) { const d = new Date(entry.created_at); if (!Number.isNaN(d.getTime())) card.append(text('div','guestbook-entry-date',new Intl.DateTimeFormat('de-DE',{dateStyle:'medium'}).format(d))); }
        list.append(card);
      }
    } catch (error) {
      list.replaceChildren();
      const panel = text('div','guestbook-load-error','Die Gästebucheinträge konnten gerade nicht geladen werden.');
      const retry = text('button','btn ghost','Erneut versuchen'); retry.type='button'; retry.addEventListener('click',loadEntries); panel.append(document.createElement('br'),retry); list.append(panel);
    }
  }
  const form=document.getElementById('guestbook-form');
  const hint=form?.querySelector('.guestbook-hint');
  form?.addEventListener('submit',async e=>{
    e.preventDefault();if(!form.reportValidity())return;
    const btn=form.querySelector('button[type=submit]');btn.disabled=true;
    hint.textContent='Nachricht wird übermittelt …';
    try{
      const payload={name:document.getElementById('guestbook-name').value.trim(),club:document.getElementById('guestbook-club').value.trim(),message:document.getElementById('guestbook-message').value.trim()};
      const res=await fetch(PUBLIC_ENTRIES_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
      const data=await res.json();if(!res.ok)throw Error(data.error||'Senden fehlgeschlagen');
      form.reset();hint.textContent='✓ Danke! Deine Nachricht wartet auf die Freigabe durch unsere Leitung.';
    }catch(err){hint.textContent='Fehler: '+err.message;}finally{btn.disabled=false;}
  });
  loadEntries();
})();
