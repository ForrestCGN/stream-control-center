# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP14C_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_TEST_DOCS
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
docs/current/RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON.md
docs/current/RDAP14C_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_TEST_DOCS.md
```

## Aktueller bestaetigter Stand

```text
RDAP14C_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_TEST_DOCS
```

RDAP14B wurde auf dem Webserver deployed und live getestet.

RDAP14C dokumentiert den Live-Test.

## Bestaetigt live

```text
GET /api/remote/lock-audit/schema-adapter/status       -> HTTP 200
GET /api/remote/lock-audit/schema-adapter/status?db=1  -> HTTP 200
GET /api/remote/auth/twitch/start                      -> HTTP 403
GET /api/remote/auth/twitch/callback                   -> HTTP 403
```

## Wichtige Live-Werte

```text
statusApiVersion=rdap14.v1
readOnly=true
writeEnabled=false
databaseWriteEnabled=false
schemaAdapterPrepared=true
lockSchemaAdapterPrepared=true
auditSchemaAdapterPrepared=true
lockAcquireEnabled=false
auditInsertEnabled=false
```

## Wichtigster Befund

Locks:

```text
compatibleForRead=true
compatibleForWrite=false
missingForWrite=["resourceType"]
writeBlockReason=resource_type_column_missing_typed_resource_key_required_and_writes_disabled
```

Audit:

```text
compatibleForRead=true
compatibleForWrite=false
writeBlockReason=writes_disabled_by_safety_flags
```

## Backup RDAP14B

```text
/var/backups/stream-control-center/RDAP14B_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_DEPLOY_TEST_remote-modboard-backend_20260624_090046.tar.gz
```

## Server-Script-Regel

Nach `systemctl restart` immer Readiness-Wait/Retry vor API-Tests.

RDAP14B bestaetigte:

```text
ready_after=2s
```

## Strukturregel

Wenn fachlich passend, vorhandene Module/Services/Routen erweitern statt neue Module anzulegen.

Neue Module nur, wenn Verantwortung wirklich nicht sauber in vorhandene Struktur passt.

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
RDAP15_LOCK_RESOURCE_TYPE_DECISION_PLAN
```

Nur Planung/Doku, keine DB-Aenderung.
