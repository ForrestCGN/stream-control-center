# TODO

Stand: RDAP35B_ADMIN_AUDIT_SCHEMA_MIGRATION_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Offen

- [ ] RDAP35B lokal einspielen und stepdone.
- [ ] RDAP36 Audit-Testinsert bauen/testen.
- [ ] Vor RDAP36 Backup von `dashboard_audit_log` erstellen und Dateigroesse pruefen.
- [ ] RDAP36 Testinsert nur mit Body-confirmWrite.
- [ ] RDAP36 Read-Back nach Insert pruefen.
- [ ] Audit-Testinsert eindeutig als RDAP36-Test markieren.
- [ ] Lock-Testwrite erst nach Audit-Testinsert.
- [ ] Keine Admin-Notiz-Writes vor erfolgreichem Audit-/Lock-Fundament.
- [ ] Kein physisches Delete bauen.

## Erledigt

- [x] RDAP35 SQL-/Doku-Vorbereitung erstellt.
- [x] RDAP35 Backup erstellt und geprueft.
- [x] RDAP35 Migration ausgefuehrt.
- [x] RDAP35 RDAP33 Route nach Migration geprueft.
- [x] Audit-Schema ist write-kandidaten-kompatibel.
