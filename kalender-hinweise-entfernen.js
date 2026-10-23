// Entfernt nur die veralteten Designvorschau-/Discord-Hinweise im Kalender.
(() => {
  const fragments = [
    'Designvorschau: Der Kalender ist noch nicht passwortgeschützt',
    'Weitere Termine werden später von der Clubleitung über Discord gepflegt',
    'Termine über Discord verwalten'
  ];
  const clean = () => {
    for (const el of document.querySelectorAll('p, small, aside, .hint, .note, .calendar-note, footer')) {
      const text = el.textContent || '';
      if (fragments.some(fragment => text.includes(fragment))) {
        // Nur kleine Hinweis-Elemente entfernen, keine ganzen Layout-Container.
        if (el.children.length === 0 || el.tagName === 'P' || el.tagName === 'SMALL') {
          el.remove();
        }
      }
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', clean);
  else clean();
})();
