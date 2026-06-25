# TODO

Stand: RDAP37B_ADMIN_LOCK_TEST_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Offen

- [ ] RDAP37B Doku lokal einspielen und `stepdone.cmd` ausfuehren.
- [ ] RDAP38 Admin-Notiz-Write mit Audit/Lock planen.
- [ ] Vor RDAP38 echte Dateien/Repo/Dokus pruefen.
- [ ] RDAP38 Permission-Pfad festlegen (`admin.users.note.write` oder bewusst anderer Key).
- [ ] RDAP38 Lock-Resource-Key fuer Admin-Notiz-Writes festlegen.
- [ ] RDAP38 Audit-Felder fuer Admin-Notiz-Writes festlegen.
- [ ] RDAP38 Fehler-/Rollback-Pfad planen.
- [ ] Keine Admin-Notiz-Writes ohne bestaetigten RDAP38-Plan bauen.
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
