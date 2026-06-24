# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN
Datum: 2026-06-24

## Zuerst lesen

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
docs/current/RDAP11C_LOCK_AUDIT_LIVE_TEST_DOCS.md
docs/current/RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN.md
```

## Aktueller bestaetigter Stand

```text
RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN
```

RDAP12 dokumentiert den Schema-Kompatibilitaetsplan fuer `dashboard_locks` und `dashboard_audit_log`.

RDAP12 ist reiner Doku-/Planungsstand:

- keine DB-Aenderung
- keine Migration
- keine Writes
- kein Login
- kein OAuth
- keine Sessions
- keine Agent-Actions

## Bestaetigter Live-Stand aus RDAP11C

```text
GET /api/remote/lock-audit/status       -> HTTP 200
GET /api/remote/lock-audit/status?db=1  -> HTTP 200
GET /api/remote/auth/twitch/start       -> HTTP 403
GET /api/remote/auth/twitch/callback    -> HTTP 403
```

Wichtige Live-Werte:

```text
statusApiVersion=rdap11.v1
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
authEnabled=false
loginEnabled=false
agentActionsEnabled=false
lockAcquireEnabled=false
auditInsertEnabled=false
```

## Schema-Befund

`dashboard_locks` existiert mit:

```text
id
lock_uid
resource_key
owner_user_uid
status
heartbeat_at
expires_at
created_at
updated_at
version_token
```

`dashboard_audit_log` existiert mit:

```text
id
audit_uid
created_at
actor_user_uid
actor_display_name
source
action
permission_key
resource_key
status
old_value_summary
new_value_summary
request_id
correlation_id
```

Beide Schemas weichen vom RDAP11-Erwartungsmodell ab.

## Empfehlung RDAP12

Kurzfristig:

```text
Kompatibilitaetslayer/Adapter statt sofortiger Migration
```

Mittelfristig:

```text
kontrollierte Schema-Erweiterung mit Backup/Rollback/eigenem Scope
```

## Server-Script-Regel

Nach `systemctl restart` immer Readiness-Wait/Retry einbauen, bevor API-Tests laufen.

Keine sofortigen `curl`-Tests direkt nach Restart.

## Naechster sinnvoller Schritt

```text
RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN
```

Alternativ:

```text
RDAP13_LOCK_AUDIT_SCHEMA_DUMP_READONLY_DOCS
```
