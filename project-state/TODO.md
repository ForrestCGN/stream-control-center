# TODO

Stand: RDAP37_ADMIN_LOCK_ACQUIRE_HEARTBEAT_RELEASE_TEST_CONFIRMED  
Datum: 2026-06-25

## Offen

- [ ] RDAP37 lokal einspielen und testen.
- [ ] RDAP37 `stepdone.cmd` nach erfolgreichem lokalem Test ausfuehren.
- [ ] RDAP37 danach Webserver-Deploy aus frischem GitHub/dev-Clone.
- [ ] Vor RDAP37 Live-Test Backup von `dashboard_locks` erstellen und Dateigroesse pruefen.
- [ ] RDAP37 Ohne-Confirm-Blocktest pruefen.
- [ ] RDAP37 Statusroute pruefen.
- [ ] RDAP37 Lock-Testcycle mit `confirmWrite=true` und `testOnly=true` pruefen.
- [ ] RDAP37 Readback nach Acquire/Heartbeat/Release pruefen.
- [ ] Pruefen, dass RDAP37 Test-Lock am Ende `released` ist.
- [ ] RDAP37B Live-Ergebnis dokumentieren.
- [ ] Keine Admin-Notiz-Writes vor erfolgreichem Audit-/Lock-Fundament.
- [ ] Kein physisches Delete bauen.
- [ ] `/api/remote/status` nach RDAP37 pruefen, ob `moduleBuild` und `statusApiVersion` wieder konsistent sichtbar sind.

## Erledigt

- [x] RDAP36 Webserver-Deploy.
- [x] RDAP36 Backup von dashboard_audit_log erstellt.
- [x] RDAP36 Ohne-Confirm-Blocktest erfolgreich.
- [x] RDAP36 Audit-Testinsert erfolgreich.
- [x] RDAP36 Readback erfolgreich.
- [x] RDAP36B Doku erstellt.
- [x] Webserver-Cleanup `_deploy_tmp` und `_runtime_tmp` durchgefuehrt.
