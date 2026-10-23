document.querySelector('.mobile').addEventListener('click',()=>{let m=document.querySelector('.menu');m.classList.toggle('show');document.querySelector('.mobile').setAttribute('aria-expanded',m.classList.contains('show'))});document.querySelectorAll('.group>button').forEach(b=>b.addEventListener('click',()=>{const g=b.parentElement;const open=g.classList.toggle('open');b.setAttribute('aria-expanded',open)}));let last=0;document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||Date.now()-last<85||matchMedia('(prefers-reduced-motion:reduce)').matches)return;last=Date.now();let s=document.createElement('span');s.className='spark';s.textContent='✧';s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';document.body.appendChild(s);setTimeout(()=>s.remove(),800)});


/* Besucherzaehler nur auf der Startseite */
(() => {
  const output = document.getElementById('pl-visit-number');
  if (!output) return;
  const endpoint = 'https://lqmwirnifapxctzmkmll.supabase.co/functions/v1/besucherzaehler';
  const key = 'pl-last-visit-v1';
  let count = true;
  try { count = Date.now() - Number(localStorage.getItem(key) || 0) >= 30 * 60 * 1000; } catch (_) {}
  fetch(endpoint, { method: count ? 'POST' : 'GET', cache: 'no-store' })
    .then(async r => {
      const data = await r.json();
      if (!r.ok || typeof data.count !== 'number') throw new Error('counter unavailable');
      output.textContent = new Intl.NumberFormat('de-DE').format(data.count);
      if (count) { try { localStorage.setItem(key, String(Date.now())); } catch (_) {} }
    })
    .catch(() => { output.textContent = '–'; output.title = 'Zähler momentan nicht verfügbar'; });
})();
