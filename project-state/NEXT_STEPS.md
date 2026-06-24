# NEXT STEPS - stream-control-center

Stand: RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON
Datum: 2026-06-24

## Naechster sinnvoller Schritt

```text
RDAP14B_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_DEPLOY_TEST
```

## Ziel RDAP14B

RDAP14 auf dem Webserver deployen und read-only testen.

## Tests live

Nach Deploy und Service-Restart mit Readiness-Wait:

```text
GET /api/remote/status
GET /api/remote/routes
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
GET /api/remote/auth/twitch/start -> 403
GET /api/remote/auth/twitch/callback -> 403
```

## Muss weiter gelten

```text
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
migrationEnabled=false
authEnabled=false
loginEnabled=false
agentActionsEnabled=false
lockAcquireEnabled=false
auditInsertEnabled=false
```

## Server-Regel

Nach `systemctl restart` immer Readiness-Wait/Retry vor API-Tests.
