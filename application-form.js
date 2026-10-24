(() => {
  'use strict';
  const ENDPOINT = 'https://lqmwirnifapxctzmkmll.supabase.co/functions/v1/bewerbung-einreichen';
  const form = document.getElementById('magic-application');
  const preview = document.getElementById('magic-preview');
  const summary = document.getElementById('magic-summary');
  const edit = document.getElementById('magic-edit');
  const send = document.getElementById('magic-send');
  const status = document.getElementById('magic-send-status');
  if (!form || !preview || !summary || !edit || !send || !status) return;
  const fields = [['sso','Star Stable Name'],['discord','Discord-Name'],['instagram','Instagram-Name'],['level','Spielerlevel'],['uniform','Uniform'],['begleiter','Begleiter'],['treffen','Clubtreffen'],['starrider','Star Rider'],['clubs','Weitere Clubs / Teams'],['age','Alter'],['about','Über mich'],['extra','Weitere Nachricht']];
  let submitted = false;
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    summary.replaceChildren();
    for (const [key, label] of fields) {
      const dt = document.createElement('dt'); dt.textContent = label;
      const dd = document.createElement('dd'); dd.textContent = String(values.get(key) || '—');
      summary.append(dt, dd);
    }
    status.textContent = '';
    preview.hidden = false;
    preview.scrollIntoView({behavior:'smooth',block:'start'});
  });
  edit.addEventListener('click', () => {
    preview.hidden = true;
    form.scrollIntoView({behavior:'smooth',block:'start'});
  });
  send.addEventListener('click', async () => {
    if (window.PL_APPLICATIONS_OPEN !== true || submitted || send.disabled || !form.reportValidity()) return;
    const v = new FormData(form);
    const answers = Object.fromEntries(fields.map(([k]) => [k, String(v.get(k) || '')]));
    const payload = {
      sso_name: answers.sso,
      discord_name: answers.discord,
      instagram: answers.instagram,
      spielerlevel: answers.level,
      alter: answers.age,
      antworten: {
        uniform: answers.uniform, begleiter: answers.begleiter,
        treffen: answers.treffen, starrider: answers.starrider,
        clubs: answers.clubs, about: answers.about, extra: answers.extra
      },
      website: ''
    };
    send.disabled = true;
    status.textContent = 'Deine Bewerbung wird übertragen …';
    try {
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const result = await res.json().catch(() => ({}));
      if (!res.ok || result.success !== true) throw new Error(result.error || 'Übertragung fehlgeschlagen');
      submitted = true;
      status.textContent = '✧ Deine Bewerbung wurde erfolgreich eingereicht!';
      send.textContent = '✓ Bewerbung eingereicht';
      edit.hidden = true;
    } catch (err) {
      status.textContent = 'Die Bewerbung konnte nicht gesendet werden: ' + err.message + '. Bitte versuche es erneut.';
      send.disabled = false;
    }
  });
})();
