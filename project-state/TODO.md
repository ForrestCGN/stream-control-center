# TODO

Stand: RDAP36B_ADMIN_AUDIT_TEST_INSERT_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Offen

- [ ] RDAP36B lokal einspielen und stepdone.
- [ ] RDAP37 Lock-Acquire/Heartbeat/Release-Test bauen/testen.
- [ ] Vor RDAP37 Backup von `dashboard_locks` erstellen und Dateigroesse pruefen.
- [ ] RDAP37 local-only, Body-confirmWrite, testOnly=true.
- [ ] RDAP37 Read-Back nach Lock-Operationen pruefen.
- [ ] Lock am Ende sauber released oder Test-Lock eindeutig dokumentieren.
- [ ] Keine Admin-Notiz-Writes vor erfolgreichem Audit-/Lock-Fundament.
- [ ] Kein physisches Delete bauen.

## Erledigt

- [x] RDAP36 Webserver-Deploy.
- [x] RDAP36 Backup von dashboard_audit_log erstellt.
- [x] RDAP36 Ohne-Confirm-Blocktest erfolgreich.
- [x] RDAP36 Audit-Testinsert erfolgreich.
- [x] RDAP36 Readback erfolgreich.
