// Öffentliche Platino-Ladies-Warteliste. Zeigt ausschließlich SSO-Namen.
(() => {
  const endpoint = 'https://lqmwirnifapxctzmkmll.supabase.co/functions/v1/oeffentliche-warteliste';
  const containers = Object.fromEntries(
    [...document.querySelectorAll('[data-status]')].map(el => [el.dataset.status, el])
  );
  const labels = {neu: 'Noch keine offenen Bewerbungen', angenommen: 'Noch keine angenommenen Bewerbungen', abgelehnt: 'Noch keine abgelehnten Bewerbungen'};
  async function load() {
    try {
      const response = await fetch(endpoint, { method: 'GET', cache: 'no-store' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (!Array.isArray(payload.eintraege)) throw new Error('Ungültige Antwort');
      for (const [status, container] of Object.entries(containers)) {
        container.replaceChildren();
      const names = payload.eintraege.filter(entry =>
  (status === 'neu'
    ? ['neu', 'in_bearbeitung'].includes(entry.status)
    : entry.status === status)
  && typeof entry.sso_name === 'string'
  && entry.sso_name.trim()
);
        if (!names.length) {
          container.textContent = labels[status];
          continue;
        }
        const list = document.createElement('ul');
        list.className = 'pl-wait-names';
        for (const entry of names) {
          const li = document.createElement('li');
          li.textContent = entry.sso_name;
          list.append(li);
        }
        container.append(list);
      }
    } catch (error) {
      console.error('Öffentliche Warteliste konnte nicht geladen werden:', error);
      for (const container of Object.values(containers)) {
        container.textContent = 'Die Warteliste ist momentan nicht verfügbar.';
      }
    }
  }
  load();
})();
