# Gästebuch: sichere Discord-Freigabe (Implementierungsplan)

## Bereits enthalten
- `gaestebuch.html`: Formular-Design und Bereich für freigegebene Einträge auf **einer Seite**.
- Formular absichtlich deaktiviert, solange der Backend-Dienst nicht existiert. Es werden keine Nachrichten vorgetäuscht oder verworfen.
- `guestbook.js`: sicheres Rendern per `textContent`; optionaler Abruf freigegebener Einträge. Aktuell ist `PUBLIC_ENTRIES_ENDPOINT` leer.

## Später im Backend + Discord-Bot umzusetzen
1. Backend mit Datenbank und `POST /api/guestbook`: Name (max. 70), Club (max. 80, optional), Nachricht (max. 1200), Eingaben serverseitig validieren, Rate-Limit, Spam-Schutz, Datenschutzinformationen. Status immer `pending` setzen.
2. Backend sendet den neuen Eintrag mit einer internen ID an den privaten Discord-Leader-Channel. **Keine Bot-Tokens oder Webhook-URLs im Website-Code.**
3. Discord-Bot mit zwei Interaktionsbuttons `Freigeben` und `Ablehnen`. Aufruf nur durch authentifizierte Discord-Mitglieder mit festgelegten IDs/Rollen von Lutz, Leo, Kayzz und Mo. Berechtigung auf dem Server prüfen, nicht im Browser.
4. Transaktionale, idempotente Statusänderung `pending -> approved/rejected`; im Channel den Status und bearbeitende Person anzeigen und Buttons deaktivieren.
5. Öffentliches `GET /api/guestbook`: ausschließlich `approved`-Einträge, paginiert und nach Datum sortiert; keine Moderationsdaten oder Discord-IDs ausgeben.
6. `PUBLIC_ENTRIES_ENDPOINT` in `guestbook.js` auf die URL der öffentlich lesbaren API setzen. Formular erst dann aktivieren und Submit über HTTPS mit Erfolg-/Fehleranzeige anbinden.
7. Nachträgliches Entfernen von Einträgen für Leader ermöglichen, Löschfristen und Datenschutzhinweise festlegen.

**Wichtig:** GitHub Pages allein kann keine Einträge sicher speichern oder Discord-Bot-Interaktionen entgegennehmen. Der Bot benötigt dauerhaftes Hosting, die API eine eigene sichere Laufzeit und eine Datenbank.
