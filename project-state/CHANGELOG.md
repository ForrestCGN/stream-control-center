# CHANGELOG

## 0.2.115 - Audit Log Retention Status and Admin UI Prep

- Neue read-only Route:
  - `GET /api/remote/admin/audit/retention/status`
- Liefert:
  - Gesamtzahl Audit-Eintraege
  - aeltester/neuster Eintrag
  - Zeitraum in Tagen
  - Counts nach Status
  - Retention-/Cleanup-Status
- Dokumentiert:
  - aktuell keine automatische Selbstbereinigung
  - aktuell unbegrenzte Speicherung
  - Vorschlag nur als Status: 180 Tage oder 10000 Eintraege
- `/api/remote/routes` um `adminAuditRetentionReadonly` erweitert.
- Keine Writes.
- Keine Migration.
- Keine Loeschung.
- Keine UI-Aktionsbuttons.
- Admin-Notizen bleiben geparkt.

## 0.2.114 - Audit Log Readonly API Deploy Confirmed

- Audit-Log API live bestaetigt.
