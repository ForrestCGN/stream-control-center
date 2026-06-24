# CHANGELOG - stream-control-center

## 2026-06-24 - RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC

### Added

- Neue read-only Admin-User-Permission-Diagnose:
  - `GET /api/remote/admin/users/permission-diagnostic`
- Neuer Service:
  - `remote-modboard/backend/src/services/admin-user-permission-read.service.js`
- Neue Route-Datei:
  - `remote-modboard/backend/src/routes/admin-users.routes.js`
- Doku:
  - `docs/current/RDAP_ADMIN_USERS5_PERMISSION_READ_DIAGNOSTIC.md`

### Changed

- `remote-modboard/backend/src/app.js` registriert die neue Admin-User-Diagnoseroute.
- `remote-modboard/backend/src/routes/routes.routes.js` listet die neue Diagnose in `/api/remote/routes`.
- RDAP-Handoff und Projektstatus wurden auf RDAP5 aktualisiert.

### Safety

- Keine User-/Rollen-/Gruppen-/Session-Writes gebaut.
- Keine UI-Schreibbuttons gebaut.
- Keine DB-Migration gebaut.
- Keine SQL-Dateien gebaut.
- Keine Agent-Actions gebaut.
- Keine OBS-/Sound-/Overlay-/Command-Steuerung gebaut.
- `canWriteAdminUsers` bleibt in diesem Step immer `false`.
