# TODO

Stand: RDAP34_ADMIN_AUDIT_SCHEMA_MIGRATION_DECISION_PLAN  
Datum: 2026-06-25

## Offen

- [ ] RDAP34 lokal einspielen und stepdone.
- [ ] RDAP35 Audit-Schema-Migration vorbereiten.
- [ ] Vor RDAP35 Backup von `dashboard_audit_log` erstellen und Dateigroesse pruefen.
- [ ] RDAP35 SQL nur fuer fehlende Spalten vorbereiten.
- [ ] RDAP35 Read-Back nach Migration pruefen.
- [ ] RDAP33 Route nach Migration erneut pruefen.
- [ ] Audit-Testinsert erst nach erfolgreicher Migration.
- [ ] Lock-Testwrite erst nach Audit-Testinsert.
- [ ] Keine Admin-Notiz-Writes vor erfolgreichem Audit-/Lock-Fundament.
- [ ] Query-Confirm spaeter separat klaeren, falls gewuenscht.
- [ ] Kein physisches Delete bauen.

## Erledigt

- [x] RDAP33 Live-Befund dokumentiert.
- [x] RDAP34 Entscheidung getroffen: Option B, bestehende Audit-Tabelle sanft erweitern.
