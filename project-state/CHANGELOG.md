# CHANGELOG

Stand: RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC  
Datum: 2026-06-24

## RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC

Typ: Backend-Diagnose/Routenuebersicht klein  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein  
Workflow-Tools: nein

### Ausgangslage

RDAP14 wurde live bestätigt. Statusroute und Admin-Notiz-Diagnose funktionierten korrekt.

Die Diagnose-Route:

```text
GET /api/remote/admin/users/admin-note-diagnostic
```

meldete erwartungsgemäß:

```text
writeEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
tableExists: false
schemaReady: false
migrationRequired: true
```

Der einzige offene Punkt war:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminUserAdminNoteDiagnostic'
```

lieferte `null`.

### Änderung

- `/api/remote/routes` ergänzt jetzt den Key `adminUserAdminNoteDiagnostic`.
- Der vorhandene/plurale Key `adminUsersAdminNoteDiagnostic` bleibt erhalten.
- `moduleBuild` wird auf `RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC` gesetzt.
- `statusApiVersion` wird auf `rdap_admin_users14b.v1` gesetzt.

### Geändert

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
docs/current/RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

### Nicht geändert

```text
Keine DB-Migration.
Keine SQL-Ausführung.
Keine CREATE TABLE Ausführung.
Keine Admin-Notiz-Writes.
Keine POST/PUT/PATCH/DELETE-Route.
Keine Audit-Inserts.
Keine Lock-Writes.
Keine UI-Schreibbuttons.
Keine Workflow-Tools.
```

## RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC

Typ: Backend-Diagnose read-only  
DB: nein  
Secrets: nein  
Produktive Writes: nein  
UI-Schreibbuttons: nein

### Ergebnis

- Admin-Notiz-Diagnose-Route live bestätigt.
- Tabelle `dashboard_user_admin_notes` fehlt noch.
- Migration ist erforderlich, aber wurde nicht ausgeführt.
- Writes bleiben blockiert.
