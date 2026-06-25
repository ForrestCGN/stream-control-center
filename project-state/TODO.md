# TODO

Stand: RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED  
Datum: 2026-06-25

## Erledigt

- [x] RDAP36 Audit-Testinsert live bestaetigt.
- [x] RDAP37 Lock Acquire/Heartbeat/Release live bestaetigt.
- [x] RDAP38 Admin-Note-Write-Planroute live bestaetigt.
- [x] RDAP39 Backend-Create-Write fuer Admin-Notizen gebaut und live bestaetigt.
- [x] Rechte-Katalog live ergaenzt: `remote.view`, `admin.users.note.read`, `admin.users.note.write`.
- [x] Owner-Rolle live ergaenzt: `owner -> admin.users.note.write -> allow`.
- [x] Echter Admin-Note-Create-Write fuer ForrestCGN erfolgreich.
- [x] Admin-Note Readback erfolgreich.
- [x] Audit Attempt + Success erfolgreich.
- [x] Lock Acquire + Release erfolgreich.
- [x] RDAP39B Doku-only erstellt.
- [x] RDAP39C fehlende echte Readroute im Repo identifiziert und wiederhergestellt.
- [x] RDAP39C Webserver-Deploy bestaetigt.
- [x] RDAP39C echte Readroute mit Session bestaetigt: `ok=true`, `notes=2`.
- [x] RDAP40 Create-UI vorbereitet.

## Offen / Naechstes

- [ ] RDAP40 lokal per `installstep.cmd` einspielen.
- [ ] RDAP40 lokale Node-Syntaxchecks ausfuehren.
- [ ] RDAP40 lokal testen / `git status` pruefen.
- [ ] RDAP40 per `stepdone.cmd` nach GitHub/dev bringen.
- [ ] RDAP40 Webserver-Deploy aus frischem GitHub/dev-Clone ausfuehren.
- [ ] RDAP40 Readiness abwarten.
- [ ] RDAP40 Browser-Test: Admin -> Admin-Notizen.
- [ ] RDAP40 Test-Create ueber UI pruefen.
- [ ] RDAP40 bestaetigen: Liste aktualisiert sich nach Create.
- [ ] RDAP40 bestaetigen: keine Update-/Deactivate-/Delete-Buttons sichtbar.
- [ ] RDAP40B Doku-only nach erfolgreichem Live-Test erstellen.
- [ ] Spaeter: Admin-Note Update/Deactivate nur als separater geplanter Step mit Audit/Lock/Backup/Confirm.
