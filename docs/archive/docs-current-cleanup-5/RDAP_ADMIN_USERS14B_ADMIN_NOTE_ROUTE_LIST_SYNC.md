# RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC

Stand: 2026-06-24
Projekt: `stream-control-center` / Remote-Modboard

## Zweck

RDAP14B ist ein kleiner Diagnose-/Routenlisten-Sync nach RDAP14.

RDAP14 war live erfolgreich:

```text
moduleBuild: RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC
statusApiVersion: rdap_admin_users14.v1
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Die eigentliche Diagnose-Route funktionierte korrekt:

```text
GET /api/remote/admin/users/admin-note-diagnostic
```

Sie meldete korrekt:

```text
readOnly: true
routeRemainsReadOnly: true
writeEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
tableExists: false
schemaReady: false
migrationRequired: true
reason: admin_note_table_missing_or_incomplete
```

Der einzige offene Punkt war die Routenuebersicht:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminUserAdminNoteDiagnostic'
```

ergab `null`, obwohl die Route selbst live funktionierte.

## Änderung

RDAP14B ergänzt in `/api/remote/routes` den erwarteten Key:

```text
adminUserAdminNoteDiagnostic
```

Zusätzlich bleibt der bereits vorhandene/plurale Key erhalten:

```text
adminUsersAdminNoteDiagnostic
```

Damit werden keine bestehenden Diagnoseinformationen entfernt.

## Erwartung nach Deploy

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminUserAdminNoteDiagnostic'
```

soll ein Objekt liefern:

```json
{
  "prepared": true,
  "route": "/api/remote/admin/users/admin-note-diagnostic",
  "tableName": "dashboard_user_admin_notes",
  "readOnly": true,
  "writeEnabled": false,
  "productiveWritesEnabled": false,
  "writesStillBlocked": true,
  "migrationEnabled": false,
  "routeRemainsReadOnly": true,
  "uiWriteButtonsEnabled": false,
  "routeListKeySynced": true,
  "aliasOf": "adminUsersAdminNoteDiagnostic"
}
```

## Nicht geändert

```text
Keine DB-Migration.
Keine SQL-Ausführung.
Keine CREATE TABLE Ausführung.
Keine Admin-Notiz-Writes.
Keine POST/PUT/PATCH/DELETE-Route.
Keine Audit-Inserts.
Keine Lock-Acquire/Heartbeat/Release.
Keine UI-Schreibbuttons.
Keine User-/Rollen-/Gruppen-/Session-Änderung.
Keine Workflow-Tools.
```

## Nächster Schritt

Nach RDAP14B bleibt der nächste Fachschritt:

```text
RDAP_ADMIN_USERS15_ADMIN_NOTE_TABLE_MIGRATION_PLAN
```

RDAP15 darf weiterhin nur planen bzw. eine Migration mit Backup/Rollback vorbereiten. Eine echte Migration braucht separates Go.
