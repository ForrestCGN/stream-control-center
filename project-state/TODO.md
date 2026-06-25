# TODO

Stand: RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Erledigt

- [x] RDAP36 Audit-Testinsert live bestaetigt.
- [x] RDAP37 Lock Acquire/Heartbeat/Release live bestaetigt.
- [x] RDAP38 Admin-Note-Write-Planroute live bestaetigt.
- [x] RDAP39 Backend-Create-Write fuer Admin-Notizen gebaut.
- [x] RDAP39 lokal eingespielt und per stepdone nach GitHub/dev gebracht.
- [x] RDAP39 Webserver-Deploy aus frischem GitHub/dev-Clone ausgefuehrt.
- [x] RDAP39 Status-/Routes-Checks bestaetigt.
- [x] Session-Lookup getestet.
- [x] Permission-Pfad getestet.
- [x] Rechte-Katalog live ergaenzt: `remote.view`, `admin.users.note.read`, `admin.users.note.write`.
- [x] Owner-Rolle live ergaenzt: `owner -> admin.users.note.write -> allow`.
- [x] Sicherer Test mit ungueltigem Zieluser bestaetigt: `target_user_not_found`, `writeExecuted=false`.
- [x] Echter Admin-Note-Create-Write fuer ForrestCGN erfolgreich.
- [x] Admin-Note Readback erfolgreich.
- [x] Audit Attempt + Success erfolgreich.
- [x] Lock Acquire + Release erfolgreich.
- [x] Bestaetigt: `dashboard_locks` nutzt `status='released'`, keine Spalte `released_at`.
- [x] RDAP39B Doku-only erstellt.

## Offen / Naechstes

- [ ] RDAP39B lokal per `installstep.cmd` einspielen.
- [ ] RDAP39B `git status` pruefen.
- [ ] RDAP39B per `stepdone.cmd` nach GitHub/dev bringen.
- [ ] Kein Webserver-Deploy fuer RDAP39B noetig, da Doku-only.
- [ ] RDAP40 planen: Admin-Note Create-UI vorbereitet.
- [ ] Vor RDAP40 echte UI-/Frontend-Dateien aus GitHub/dev pruefen.
- [ ] RDAP40 nur kleinen Create-Dialog/Button vorbereiten.
- [ ] RDAP40 keine Update-/Deactivate-/Delete-Funktion bauen.
- [ ] RDAP40 keine Community-Seiten-Anbindung fuer Admin-Notizen bauen.
- [ ] Spaeter: Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
