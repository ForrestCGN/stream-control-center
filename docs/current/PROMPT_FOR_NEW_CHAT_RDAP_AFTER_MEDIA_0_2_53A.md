Wir arbeiten am Projekt `stream-control-center` / `remote-modboard` / RDAP fuer ForrestCGN.

Aktueller Stand: `0.2.53A - Media UI Layout Hotfix`.

Wichtig:

- GitHub/dev und Docs zuerst lesen.
- Online und lokal getrennte UI-Dateien pruefen:
  - `remote-modboard/backend/public/assets/modules/media/library.js`
  - `htdocs/dashboard-v2/assets/modules/media/library.js`
- 0.2.53A war ein reiner UI-Hotfix.
- Naechstes Ziel: Media Full-Sync in Chunks zur Online-DB, danach Online-Lesequelle aus DB.
- Keine produktiven Upload/Edit/Delete/Writes ohne separaten Permission-/Audit-/Confirm-Step.
