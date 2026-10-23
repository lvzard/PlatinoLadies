# Mitgliederkalender – Vorschau

- `kalender.html` ist eine vollständige statische Vorschau mit Monats-/Wochenansicht, anklickbaren Dressurterminen und Countdown.
- Wiederkehrende Dressur: Dienstag und Sonntag, 20:00–21:00 Uhr (lokale Browserzeit).
- Weitere Termine/Kategorien sind vorbereitet, aber noch nicht mit Discord verbunden.
- Alle Leader (Lutz, Leo, Kayzz, Mo) sollen später mit `/termin erstellen`, `/termin bearbeiten`, `/termin löschen` Termine verwalten. Die Backend-API muss Discord-User-IDs/Rollen serverseitig prüfen.
- Eine echte Mitglieder-Zugriffssperre ist auf GitHub Pages noch NICHT vorhanden. Auch `kalender.html` ist bis zur sicheren Backend-Anbindung öffentlich direkt aufrufbar.
- Das gemeinsame Passwort darf nicht als Klartext in JavaScript abgelegt werden.
- API/Datenbank werden später benötigt, um Termine zu speichern und sicher auszuliefern.
