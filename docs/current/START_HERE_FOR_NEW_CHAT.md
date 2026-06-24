# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON
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
docs/current/RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN.md
docs/current/RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON.md
```

## Aktueller bestaetigter Stand

```text
RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON
```

RDAP14 erweitert die vorhandene Lock-/Audit-Diagnose um read-only Schema-Adapter-Ausgaben.

Wichtig: Keine unnoetigen neuen Module. Adapter-Logik wurde in vorhandene Services integriert, Route in vorhandenes Lock-/Audit-Diagnose-Modul.

## Geaenderte Backend-Dateien

```text
remote-modboard/backend/src/services/lock-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
remote-modboard/backend/src/routes/lock-audit-diagnostic.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Neue Route

```text
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

## Weiterhin verboten

- kein Login
- kein OAuth
- keine Cookies
- keine Sessions
- keine DB-Writes
- keine Migration
- keine Remote-Writes
- keine Agent-Actions
- keine Secrets

## Naechster sinnvoller Schritt

```text
RDAP14B_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_DEPLOY_TEST
```

Nur nach lokalem Check und sauberem Commit.

## Server-Script-Regel

Nach `systemctl restart` immer Readiness-Wait/Retry vor API-Tests.
