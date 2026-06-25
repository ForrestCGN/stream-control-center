# CHANGELOG

## RDAP34_ADMIN_AUDIT_SCHEMA_MIGRATION_DECISION_PLAN - 2026-06-25

- Audit-Schema-Entscheidung dokumentiert.
- RDAP33B Live-Befund ausgewertet:
  - `dashboard_audit_log` existiert, aber generischer Write-Kandidat blockiert wegen fehlendem `resource_type`.
  - `dashboard_locks` existiert und wirkt fuer ersten Lock-Write-Kandidaten brauchbar.
- Entscheidung:
  - Direkt richtig = Option B.
  - Bestehende `dashboard_audit_log` sanft erweitern.
  - Keine neue Parallelstruktur.
  - Keine reine Mapping-Abkuerzung als Dauerloesung.
- Naechster Step:
  - `RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED`.
- Keine Backend-/UI-/DB-Aenderung.
