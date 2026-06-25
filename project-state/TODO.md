# TODO

Stand: RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED  
Datum: 2026-06-25

## Offen

- [ ] RDAP35 lokal einspielen und stepdone.
- [ ] RDAP35 SQL vom Webserver-Deploy-Clone ausfuehren.
- [ ] Backup von `dashboard_audit_log` erstellen.
- [ ] Backup-Datei pruefen, nicht 0 Byte.
- [ ] Precheck SQL ausfuehren.
- [ ] Migration SQL ausfuehren.
- [ ] Readback SQL ausfuehren.
- [ ] RDAP33 Route nach Migration erneut pruefen.
- [ ] RDAP35B Live-Ergebnis dokumentieren.
- [ ] Audit-Testinsert erst nach erfolgreicher Migration.
- [ ] Lock-Testwrite erst nach Audit-Testinsert.
- [ ] Keine Admin-Notiz-Writes vor erfolgreichem Audit-/Lock-Fundament.
- [ ] Kein physisches Delete bauen.

## Erledigt

- [x] RDAP34 Entscheidung: Option B, bestehende Audit-Tabelle sanft erweitern.
- [x] RDAP35 SQL-/Doku-Vorbereitung erstellt.
