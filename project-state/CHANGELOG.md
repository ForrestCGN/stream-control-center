# CHANGELOG

## 0.2.113 - Audit Log Readonly API

- Neue read-only Route:
  - `GET /api/remote/admin/audit/log`
- Liefert Audit-/Aktivitaets-Log aus `dashboard_audit_log`.
- Filter:
  - `limit`
  - `status`
  - `action`
  - `actor`
- `/api/remote/routes` um `adminAuditLogReadonly` erweitert.
- Keine Writes.
- Keine Migration.
- Keine UI.
- Keine Agent-Actions.
- Admin-Notizen bleiben geparkt.

## 0.2.112 - Audit Log Readonly View Plan

- Audit-/Aktivitaets-Log als Hauptziel festgelegt.
