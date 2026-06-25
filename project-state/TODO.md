# TODO

Stand: RDAP38B_ADMIN_NOTE_WRITE_PLAN_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Offen

- [ ] RDAP39 Admin-Notiz-Write Backend planen.
- [ ] Vor RDAP39 echte Dateien/Repo/Dokus pruefen.
- [ ] RDAP39 Backup von `dashboard_user_admin_notes` erstellen und Dateigroesse pruefen.
- [ ] RDAP39 Permission-Pfad `admin.users.note.write` final pruefen.
- [ ] RDAP39 Confirm-Write nur im JSON-Body umsetzen.
- [ ] RDAP39 Zieluser-Pruefung ueber `dashboard_users` bestaetigen.
- [ ] RDAP39 Lock-Resource-Key je Aktion final verwenden.
- [ ] RDAP39 Audit-Felder fuer Admin-Notiz-Writes final verwenden.
- [ ] RDAP39 Fehler-/Rollback-Pfad umsetzen.
- [ ] RDAP39 kontrollierten Backend-Write testen.
- [ ] RDAP39 Readback nach Write pruefen.
- [ ] RDAP39 Lock am Ende released pruefen.
- [ ] RDAP39 Audit attempt/success/failure pruefen.
- [ ] Keine UI-Schreibbuttons vor bestaetigtem Backend-Write-Test bauen.
- [ ] Kein physisches Delete bauen.
- [ ] Community-Seiten-Anbindung spaeter separat planen.
- [ ] Local-LAN-Modus spaeter nach stabilem Webdashboard weiterplanen.

## Erledigt

- [x] RDAP36 Webserver-Deploy.
- [x] RDAP36 Backup von dashboard_audit_log erstellt.
- [x] RDAP36 Ohne-Confirm-Blocktest erfolgreich.
- [x] RDAP36 Audit-Testinsert erfolgreich.
- [x] RDAP36 Readback erfolgreich.
- [x] RDAP36B Doku erstellt.
- [x] Webserver-Cleanup `_deploy_tmp` und `_runtime_tmp` durchgefuehrt.
- [x] RDAP37 lokal eingespielt und getestet.
- [x] RDAP37 `stepdone.cmd` nach erfolgreichem lokalem Test ausgefuehrt.
- [x] RDAP37 Webserver-Deploy aus frischem GitHub/dev-Clone.
- [x] Vor RDAP37 Live-Test Backup von `dashboard_locks` erstellt und Dateigroesse geprueft.
- [x] RDAP37 Ohne-Confirm-Blocktest erfolgreich.
- [x] RDAP37 Statusroute erfolgreich.
- [x] RDAP37 Lock-Testcycle mit `confirmWrite=true` und `testOnly=true` erfolgreich.
- [x] RDAP37 Readback nach Acquire/Heartbeat/Release erfolgreich.
- [x] RDAP37 Test-Lock am Ende `released`.
- [x] `/api/remote/status` nach RDAP37 zeigt konsistent `moduleBuild` und `statusApiVersion`.
- [x] RDAP37B Doku lokal eingespielt und `stepdone.cmd` ausgefuehrt.
- [x] RDAP38 Admin-Notiz-Write-Plan gebaut.
- [x] RDAP38 lokal eingespielt und getestet.
- [x] RDAP38 `stepdone.cmd` ausgefuehrt.
- [x] RDAP38 Webserver-Deploy aus frischem GitHub/dev-Clone.
- [x] RDAP38 `/api/remote/status` bestaetigt.
- [x] RDAP38 `/api/remote/routes` bestaetigt.
- [x] RDAP38 `/api/remote/admin/users/admin-notes/write-plan` bestaetigt.
- [x] RDAP38B Live-Ergebnis dokumentiert.
