# CHANGELOG

## RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED - 2026-06-25

- Ersten kontrollierten Backend-Create-Write fuer Admin-Notizen vorbereitet.
- Neue produktive Create-Logik:
  - `POST /api/remote/admin/users/admin-notes/create`
- Weiterhin deaktiviert:
  - `update`
  - `deactivate`
  - UI-Schreibbuttons
  - physisches Delete
- RDAP39 prueft:
  - Session
  - Dashboard-Zugriff
  - `remote.view`
  - `admin.users.note.write`
  - `confirmWrite` nur im JSON-Body
  - Zieluser
  - Tabellen-Schema
- RDAP39 nutzt:
  - `dashboard_locks` fuer Lock acquire/release
  - `dashboard_audit_log` fuer Audit attempt/success/failure
  - `dashboard_user_admin_notes` fuer Create + Readback
- Backup vor erstem Live-Write bleibt Pflicht.
- Naechster Step nach Live-Test:
  - `RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS`
