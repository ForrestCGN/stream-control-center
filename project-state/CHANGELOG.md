# CHANGELOG

Stand: RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC  
Datum: 2026-06-24

## RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC

Typ: Backend-Diagnose read-only + Doku  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein  
DB-Migration: nein  
Workflow-Tools: nein

### Ergebnis

- Neue read-only Diagnose-Route vorbereitet:
  `GET /api/remote/admin/users/admin-note-diagnostic`
- Prüft lesend, ob `dashboard_user_admin_notes` existiert.
- Prüft lesend erwartete Mindestspalten.
- Meldet `migrationRequired`, ohne Migration auszuführen.
- Registriert vorhandene `admin-users.routes.js` im App-Setup, damit bestehende read-only Admin-Diagnoserouten erreichbar sind.
- `/api/remote/routes` listet die neue Admin-Notiz-Diagnose.
- `/api/remote/status` meldet RDAP14 als Build/API-Stand.

### Nicht geändert

- Keine POST/PUT/PATCH/DELETE-Routen.
- Keine DB-Migration.
- Keine SQL-Ausführung.
- Keine Admin-Notiz-Writes.
- Keine Audit-Inserts.
- Keine Lock-Writes.
- Keine User-/Rollen-/Gruppen-/Session-Writes.
- Keine UI-Schreibbuttons.
- Keine Agent-/OBS-/Sound-/Overlay-/Command-Actions.
- Keine Workflow-Tools.

### Geändert

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-diagnostic.service.js
docs/current/RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```
