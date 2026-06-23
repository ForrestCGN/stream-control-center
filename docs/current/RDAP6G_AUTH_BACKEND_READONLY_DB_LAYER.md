# RDAP6G Auth Backend Read-only DB Layer

Stand: 2026-06-23  
Status: Read-only Backend-Erweiterung, keine Auth-Aktivierung

## Zweck

RDAP6G fuegt dem Remote-Modboard eine sichere interne read-only DB-Schicht hinzu, damit das Backend das geplante Auth-/Rollen-/Gruppen-/Permission-Modell aus MariaDB lesen und diagnostisch ausgeben kann.

Dieser Step aktiviert weiterhin keine Anmeldung, keine Sessions, keine Locks, keine Audit-Schreibungen und keine Remote-Aktionen.

## Grundlage

Gepruefte Basis:

```text
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
db/rdap6c/sql/001_rdap6c_schema_migration.sql
db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql
docs/current/RDAP6F_AUTH_DB_INTEGRATION_PLAN.md
```

## Ziel-DB

```text
Echte Remote-Modboard-/Auth-Ziel-DB: c3stream_control
DB-User: c1stream_control
Test-DB scc_rdap6_test bleibt reine Testdatenbank.
```

RDAP6G fuehrt keine Migration aus. Wenn die Tabellen in `c3stream_control` noch fehlen, meldet die neue Route das sauber als `schema.ready=false` und listet fehlende Tabellen.

## Neue Route

```text
GET /api/remote/auth/model
```

Diese Route liest ausschliesslich und gibt aus:

```text
schema.expectedTables
schema.existingTables
schema.missingTables
schema.ready
counts
model.migrations
model.roles
model.groups
model.permissions
model.rolePermissions
model.modulePermissions
validation
warnings
```

## Neue Dateien

```text
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/routes/auth-model.routes.js
```

## Geaenderte Dateien

```text
remote-modboard/backend/package.json
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
docs/current/START_HERE_FOR_NEW_CHAT.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
```

## Read-only Sicherheitsregeln

RDAP6G setzt bewusst:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
```

Nicht erlaubt und nicht umgesetzt:

```text
kein Login
keine Cookies
keine Session-Erstellung
keine Lock-Erstellung
keine Audit-Schreibung
keine User-/Rollen-/Gruppen-Schreibaktion
keine SQL-Migration
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine Secrets im Repo oder Frontend
```

## Schema-Pruefung

Die Route prueft ueber `INFORMATION_SCHEMA.TABLES`, welche RDAP6C-Tabellen in der verbundenen DB existieren.

Erwartete Tabellen:

```text
schema_migrations
dashboard_users
dashboard_identities
dashboard_roles
dashboard_user_roles
dashboard_groups
dashboard_user_groups
dashboard_permissions
dashboard_role_permissions
dashboard_module_permissions
dashboard_sessions
dashboard_locks
dashboard_audit_log
```

Wenn Tabellen fehlen, werden keine fehlerhaften Tabellen-Queries ausgefuehrt. Die Route bleibt stabil und meldet den fehlenden Stand.

## sound_profi-Regel

`auth-db-read.service.js` validiert diagnostisch:

```text
soundProfiIsRole
soundProfiRoleCount
soundProfiIsGroupMarker
soundProfiGroupMarkerCount
soundProfiGrantsPermissionsByItself
soundProfiRolePermissionCount
```

Ziel bleibt:

```text
sound_profi ist keine Rolle.
sound_profi ist Gruppe/Marker.
sound_profi vergibt selbst keine globalen Rechte.
```

## Tests

Nach Installation lokal:

```powershell
cd D:\Git\stream-control-center
.\installstep.cmd "$env:USERPROFILE\Downloads\RDAP6G_AUTH_BACKEND_READONLY_DB_LAYER.zip" "RDAP6G Auth Backend Read-only DB Layer"
```

Nach Deploy/Node-Neustart auf Webserver spaeter pruefen:

```text
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/auth/model
```

Erwartung vor Produktivmigration:

```text
Route antwortet stabil.
readOnly=true
writeEnabled=false
authEnabled=false
sessionCreationEnabled=false
schema.ready kann false sein, wenn Tabellen in c3stream_control noch nicht angelegt wurden.
```

## Rollback

```text
stepundo.cmd
```

Bei Webserver-Deployment zusaetzlich vorherigen Remote-Modboard-Code zurueckspielen und Service neu starten.

## Naechster sinnvoller Schritt

```text
RDAP6H_AUTH_DB_PRODUCTION_MIGRATION_RUNBOOK
```

Ziel von RDAP6H:

```text
Backup-/Restore-/Produktiv-Migrations-Runbook fuer c3stream_control vorbereiten.
```

RDAP6H darf noch nicht blind ausfuehren. Produktivmigration nur nach Backup, Restore-Test, Validation und separatem Go.
