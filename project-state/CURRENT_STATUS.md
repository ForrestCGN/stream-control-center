# CURRENT STATUS

Stand: RDAP6L_AUTH_DB_PRODUCTIVE_MIGRATION_RESULT_DOCS  
Datum: 2026-06-23

## Aktueller bestaetigter Arbeitsstand

RDAP6K wurde erfolgreich auf der echten Remote-Modboard-/Auth-Ziel-DB `c3stream_control` ausgefuehrt. RDAP6L dokumentiert dieses Ergebnis.

Der Remote-Modboard-Service bleibt weiterhin read-only. Es wurde keine Authentifizierung aktiviert, keine Session-Erstellung aktiviert und keine Schreibroute freigeschaltet.

Fertig und getestet:

```text
RDAP5I Remote-Modboard Node-Basisdienst read-only live
RDAP5J Remote Node Monitoring/Hardening
RDAP4B -> RDAP5C3 Remote-Agent Rollen/Gruppen-Korrektur
RDAP6D Testdatenbanklauf auf Webserver bestanden
RDAP6E Test-DB-Auswertung dokumentiert
RDAP6F Auth DB Integration Plan dokumentiert
RDAP6G Auth Backend Read-only DB Layer vorbereitet und deployed
RDAP6H Remote read-only Auth-Model Deploy/Test bestanden
RDAP6I Auth DB Production Migration Runbook dokumentiert
RDAP6J Productive Migration Precheck bestanden und Backup erstellt
RDAP6K Produktive Auth-DB Schema-/Seed-Migration auf c3stream_control erfolgreich ausgefuehrt
RDAP6L Auth DB Productive Migration Result Docs erstellt
```

## Remote-Modboard read-only live

Der Remote-Modboard-Node-Basisdienst laeuft read-only auf dem Webserver:

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
moduleBuild live: RDAP6H_REMOTE_READONLY_AUTH_MODEL_DEPLOY_TEST
```

Live verfuegbare Routen:

```text
GET https://mods.forrestcgn.de/api/remote/health
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/health?db=1
GET https://mods.forrestcgn.de/api/remote/auth/model
```

Bestaetigte Sicherheitswerte:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
productiveAgentRuntime: false
agentActionsEnabled: false
```

## Service-/Runtime-Stand

```text
Node: v20.19.2
npm: 9.2.0
MariaDB: 11.8.6
mysql2: 3.22.5
express: 5.2.1
dotenv: 17.4.2
```

## Installierte Pfade auf Webserver

```text
/opt/stream-control-center/remote-modboard/backend
/etc/stream-control-center/remote-modboard.env
/etc/systemd/system/scc-remote-modboard.service
```

Service-User:

```text
sccremote
```

Node-Service laeuft nicht als root.

## Webserver-DB final korrigiert

Final bestaetigt:

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Nicht mehr verwenden:

```text
DB_USER=c3stream_control
DB_NAME=c1stream_control
```

Passwort wird nicht dokumentiert und darf nicht ins Repo, Frontend oder Chat.

## RDAP6K produktive Migration

RDAP6K wurde auf dem Webserver gegen `c3stream_control` ausgefuehrt.

Vorheriges Backup:

```text
/root/rdap6j_backup_20260623_152934/c3stream_control_before_rdap6_migration.sql
```

Ausgefuehrte Dateien:

```text
db/rdap6c/sql/001_rdap6c_schema_migration.sql
db/rdap6c/sql/002_rdap6c_seed_roles_groups_permissions.sql
db/rdap6c/checks/rdap6c_validation_queries.sql
```

Migrationsergebnis:

```text
Schema-Migration: OK
Seed-Migration: OK
Validation: OK
schema.ready: true
missingTables: []
dashboard_roles: 6
dashboard_groups: 1
dashboard_permissions: 22
dashboard_role_permissions: 18
dashboard_module_permissions: 0
dashboard_sessions: 0
dashboard_locks: 0
dashboard_audit_log: 0
```

Rollen-/Gruppen-Validierung:

```text
sound_profi_role_count = 0
sound_profi_group_marker_count = 1
sound_profi_role_permission_count = 0
module_permission_table_rows = 0
session_rows = 0
lock_rows = 0
audit_rows = 0
```

## Remote-Agent / Rollen-/Gruppenmodell

`backend/modules/remote_agent.js` steht auf:

```text
moduleVersion: 0.0.3
moduleBuild: RDAP5C3_REMOTE_AGENT_ROLE_GROUP_MARKER_REVISION_READONLY
```

Fuehrend bleibt RDAP5C3:

```text
Rollen und Gruppen sind getrennt.
sound_profi ist keine Rolle.
sound_profi ist keine feste Rechte-Sammlung.
sound_profi ist eine Gruppe / Markierung.
Modulrechte werden pro Modul konfiguriert.
```

Der Remote-Agent bleibt read-only.

## Nicht umgesetzt

```text
kein Auth/Login aktiv
keine produktiven Sessions aktiv
keine Remote-Writes
kein produktiver WSS-Agent
keine Agent-Actions
keine OBS-/Sound-/Overlay-/Command-Steuerung
keine lokale SQLite-Aenderung
keine freie Shell-/Datei-/Prozesssteuerung
keine Secrets im Repo oder Frontend
```

## Wichtiger Doku-Hinweis

Einige Dateinamen aus Zwischen-Prompts existieren nicht in GitHub/dev und nicht lokal. Sie duerfen nicht als Pflichtdateien vorausgesetzt werden.

Nicht vorhandene Zwischenstand-Dateien:

```text
docs/current/RDAP_STATUS_AND_NEXT_STEPS_2026-06-23.md
docs/current/RDAP5J_LIVE_TEST_RESULT_2026-06-23.md
docs/current/RDAP4B_REMOTE_AGENT_RDAP5C3_LIVE_TEST_RESULT_2026-06-23.md
docs/current/RDAP6_AUTH_DB_MIGRATION_PREP_PLAN.md
docs/current/RDAP6B_TEST_DB_DRY_RUN_RUNBOOK.md
```

## Naechster sinnvoller Schritt

```text
RDAP7_LOGIN_SESSION_CONCEPT
```

Ziel:

```text
Login-/Session-Konzept fuer Remote-Modboard planen, ohne direkt Login, Cookies oder Sessions zu aktivieren.
```

Weiterhin keine Auth-Aktivierung, keine Sessions, keine API-Writes und keine Agent-Actions ohne separaten Plan und separates Go.
