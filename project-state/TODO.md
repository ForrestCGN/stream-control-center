# TODO

Stand: RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC  
Datum: 2026-06-25

## Erledigt

- [x] RDAP36 Audit-Testinsert live bestaetigt.
- [x] RDAP37 Lock Acquire/Heartbeat/Release live bestaetigt.
- [x] RDAP38 Admin-Note-Write-Planroute live bestaetigt.
- [x] RDAP39 Backend-Create-Write fuer Admin-Notizen gebaut.
- [x] RDAP39 lokal eingespielt und per stepdone nach GitHub/dev gebracht.
- [x] RDAP39 Webserver-Deploy aus frischem GitHub/dev-Clone ausgefuehrt.
- [x] RDAP39 Status-/Routes-Checks bestaetigt.
- [x] Rechte-Katalog live ergaenzt: `remote.view`, `admin.users.note.read`, `admin.users.note.write`.
- [x] Owner-Rolle live ergaenzt: `owner -> admin.users.note.write -> allow`.
- [x] Echter Admin-Note-Create-Write fuer ForrestCGN erfolgreich.
- [x] Admin-Note Readback erfolgreich.
- [x] Audit Attempt + Success erfolgreich.
- [x] Lock Acquire + Release erfolgreich.
- [x] RDAP39B Doku-only erstellt.
- [x] RDAP39C fehlende echte Readroute im Repo identifiziert.
- [x] RDAP39C Read-Service `admin-user-admin-note-real-read-authed.service.js` wieder als Zielpfad vorbereitet.
- [x] RDAP39C `GET /api/remote/admin/users/admin-notes/read` in `admin-users.routes.js` vorbereitet.
- [x] RDAP39C `/api/remote/routes` um `adminNoteReadRestored` ergaenzt.

## Offen / Naechstes

- [ ] RDAP39C lokal per `installstep.cmd` einspielen.
- [ ] RDAP39C lokale Node-Syntaxchecks ausfuehren.
- [ ] RDAP39C lokal testen / `git status` pruefen.
- [ ] RDAP39C per `stepdone.cmd` nach GitHub/dev bringen.
- [ ] RDAP39C Webserver-Deploy aus frischem GitHub/dev-Clone ausfuehren.
- [ ] RDAP39C Readiness abwarten.
- [ ] RDAP39C `/api/remote/routes` pruefen.
- [ ] RDAP39C echte Readroute mit Session pruefen.
- [ ] RDAP40 planen: Admin-Note Create-UI vorbereitet.
- [ ] RDAP40 nur kleinen Create-Dialog/Button vorbereiten.
- [ ] RDAP40 keine Update-/Deactivate-/Delete-Funktion bauen.
- [ ] RDAP40 keine Community-Seiten-Anbindung fuer Admin-Notizen bauen.
- [ ] Spaeter: Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
