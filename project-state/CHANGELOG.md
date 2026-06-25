# CHANGELOG - stream-control-center

## 2026-06-25 - RDAP17B Route-List-Sync

- RDAP17 Read-Diagnostic-Route war live erreichbar, aber `/api/remote/routes` lieferte fuer `.adminUserAdminNoteReadDiagnostic` noch `null`.
- `remote-modboard/backend/src/routes/routes.routes.js` wurde synchronisiert.
- Neue Routenuebersicht-Version: `rdap_admin_users17b.v1`.
- `adminUserAdminNoteReadDiagnostic` und `adminUsersAdminNoteReadDiagnostic` dokumentieren jetzt den read-only Status.
- Keine DB-Aenderung, keine Writes, keine UI-Schreibbuttons.
