document.querySelector('.mobile').addEventListener('click',()=>{let m=document.querySelector('.menu');m.classList.toggle('show');document.querySelector('.mobile').setAttribute('aria-expanded',m.classList.contains('show'))});document.querySelectorAll('.group>button').forEach(b=>b.addEventListener('click',()=>{const g=b.parentElement;const open=g.classList.toggle('open');b.setAttribute('aria-expanded',open)}));let last=0;document.addEventListener('pointermove',e=>{if(e.pointerType!=='mouse'||Date.now()-last<85||matchMedia('(prefers-reduced-motion:reduce)').matches)return;last=Date.now();let s=document.createElement('span');s.className='spark';s.textContent='✧';s.style.left=e.clientX+'px';s.style.top=e.clientY+'px';document.body.appendChild(s);setTimeout(()=>s.remove(),800)});

/* Platino Ladies – gemeinsamer Besucherzähler im öffentlichen Footer. */
(() => {
  const footer = document.querySelector('footer');
  if (!footer || document.querySelector('#pl-visit-counter')) return;
  const endpoint = 'https://lqmwirnifapxctzmkmll.supabase.co/functions/v1/besucherzaehler';
  const style = document.createElement('style');
  style.textContent = `
    #pl-visit-counter { margin: 14px auto 0; display:flex; align-items:center;
      justify-content:center; gap:8px; color:#d9c3ee; font-size:.88rem; letter-spacing:.035em; }
    #pl-visit-counter .pl-eye { color:#b88add; font-size:1.1rem; }
    #pl-visit-counter strong { color:#f0ddff; font-variant-numeric:tabular-nums; }
  `;
  document.head.appendChild(style);
  const display = document.createElement('div');
  display.id = 'pl-visit-counter';
  display.setAttribute('aria-live', 'polite');
  display.innerHTML = '<span class="pl-eye" aria-hidden="true">✧</span><span>Besuche insgesamt: <strong>…</strong></span>';
  footer.appendChild(display);
  const number = display.querySelector('strong');
  const key = 'pl-last-visit-v1';
  const windowMs = 30 * 60 * 1000;
  let shouldCount = true;
  try { shouldCount = Date.now() - Number(localStorage.getItem(key) || 0) >= windowMs; } catch (_) {}
  fetch(endpoint, { method: shouldCount ? 'POST' : 'GET', cache: 'no-store' })
    .then(async response => {
      const data = await response.json();
      if (!response.ok || typeof data.count !== 'number') throw new Error('counter unavailable');
      number.textContent = new Intl.NumberFormat('de-DE').format(data.count);
      if (shouldCount) { try { localStorage.setItem(key, String(Date.now())); } catch (_) {} }
    })
    .catch(() => { display.style.display = 'none'; });
})();
