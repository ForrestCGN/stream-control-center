# CURRENT STATUS

Stand: RDAP7D_AUTH_STATUS_DEPLOY_RESULT_DOCS  
Datum: 2026-06-23

## Aktueller bestaetigter Arbeitsstand

RDAP7B Auth Read-only Status Endpoints wurden gebaut, committed, gepusht, auf dem Webserver deployed und in RDAP7C live getestet.

RDAP7D dokumentiert diesen bestaetigten Live-Test.

## Fertig und getestet

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
RDAP7 Login-/Session-Konzept dokumentiert
RDAP7A Auth Read-only User Resolution Plan dokumentiert
RDAP7B Auth Read-only Status Endpoints gebaut und gepusht
RDAP7C Remote Auth Status Deploy/Test bestanden
RDAP7D Auth Status Deploy Result Docs erstellt
```

## Remote-Modboard live

```text
Webserver: web.cgn.community
Subdomain/API: https://mods.forrestcgn.de/api/remote/
Service: scc-remote-modboard.service
Listen intern: 127.0.0.1:3010
moduleBuild live: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
```

Live verfuegbare Routen:

```text
GET https://mods.forrestcgn.de/api/remote/health
GET https://mods.forrestcgn.de/api/remote/status
GET https://mods.forrestcgn.de/api/remote/routes
GET https://mods.forrestcgn.de/api/remote/health?db=1
GET https://mods.forrestcgn.de/api/remote/auth/model
GET https://mods.forrestcgn.de/api/remote/auth/me
GET https://mods.forrestcgn.de/api/remote/auth/session-status
```

Bestaetigte Sicherheitswerte:

```text
readOnly: true
writeEnabled: false
migrationEnabled: false
authEnabled: false
sessionCreationEnabled: false
loggedIn: false
productiveAgentRuntime: false
agentActionsEnabled: false
```

## Webserver-DB

```text
DB_USER=c1stream_control
DB_NAME=c3stream_control
```

Passwort wird nicht dokumentiert und darf nicht ins Repo, Frontend oder Chat.

## RDAP6K produktive Migration

Vorheriges Backup:

```text
/root/rdap6j_backup_20260623_152934/c3stream_control_before_rdap6_migration.sql
```

Migrationsergebnis:

```text
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
sound_profi_role_count = 0
sound_profi_group_marker_count = 1
sound_profi_role_permission_count = 0
```

## RDAP7C Live-Test

Bestaetigt:

```text
Service: active
moduleBuild live: RDAP7B_AUTH_READONLY_STATUS_ENDPOINTS
/api/remote/routes: neue Auth-Status-Routen sichtbar
/api/remote/auth/me: OK
/api/remote/auth/session-status: OK
/api/remote/auth/model: weiterhin read-only, schema.ready true
```

Deploy-Backup:

```text
/root/rdap7c_backup_remote_modboard_20260623_172801
```

Hinweis: Dieser Backup-Pfad ist noch Altbestand unter `/root`. Ab jetzt gilt die neue Server-Ordnerregel.

## Server-Ordnerregel ab jetzt

```text
Deploy-/Test-Clones: /opt/stream-control-center/_deploy_tmp/
Run-/Log-/Temp-Kram: /opt/stream-control-center/_runtime_tmp/
Backups: /var/backups/stream-control-center/
```

Keine neuen RDAP-Arbeitsordner/Backups lose unter `/root`.

RDAP7C1 Cleanup ist vorbereitet, aber ohne bestaetigte Server-Ausgabe nicht als erledigt dokumentiert.

## Naechster sinnvoller Schritt

```text
RDAP7E_TWITCH_OAUTH_DRY_RUN_PLAN
```

Ziel:

```text
Twitch-OAuth-Dry-Run planen, ohne Login zu aktivieren und ohne Secrets ins Repo zu schreiben.
```
