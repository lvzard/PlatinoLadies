(() => {
  const form = document.getElementById('magic-application');
  const preview = document.getElementById('magic-preview');
  const summary = document.getElementById('magic-summary');
  const edit = document.getElementById('magic-edit');
  if (!form || !preview || !summary || !edit) return;
  const fields = [['sso','Star Stable Name'],['discord','Discord-Name'],['instagram','Instagram-Name'],['level','Spielerlevel'],['uniform','Uniform'],['begleiter','Begleiter'],['treffen','Clubtreffen'],['starrider','Star Rider'],['clubs','Weitere Clubs / Teams'],['age','Alter'],['about','Über mich'],['extra','Weitere Nachricht']];
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
    preview.hidden = false; preview.scrollIntoView({behavior:'smooth',block:'start'});
  });
  edit.addEventListener('click', () => { preview.hidden = true; form.scrollIntoView({behavior:'smooth',block:'start'}); });
})();
