# TODO

Stand: RDAP36_ADMIN_AUDIT_TEST_INSERT_CONFIRMED  
Datum: 2026-06-25

## Offen

- [ ] RDAP36 lokal einspielen und stepdone.
- [ ] RDAP36 Webserver-Deploy.
- [ ] Vor RDAP36 Testinsert Backup von `dashboard_audit_log` erstellen.
- [ ] Backup-Datei pruefen, nicht 0 Byte.
- [ ] Ohne Confirm testen -> muss blocken.
- [ ] Mit Body-confirmWrite und testOnly=true Testinsert ausfuehren.
- [ ] Read-Back pruefen.
- [ ] RDAP36B Live-Ergebnis dokumentieren.
- [ ] Lock-Testwrite erst nach Audit-Testinsert.
- [ ] Keine Admin-Notiz-Writes vor erfolgreichem Audit-/Lock-Fundament.
- [ ] Kein physisches Delete bauen.

## Erledigt

- [x] RDAP35B Audit-Schema-Migration live bestaetigt.
- [x] RDAP36 Audit-Testinsert-Route gebaut.
