# CURRENT STATUS - stream-control-center

Stand: RDAP14C_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_TEST_DOCS
Datum: 2026-06-24

## Aktueller bestaetigter Arbeitsstand

RDAP14B wurde live deployed und getestet.

RDAP14C dokumentiert den Live-Test.

Remote-Modboard:

```text
https://mods.forrestcgn.de/api/remote/
127.0.0.1:3010
scc-remote-modboard.service
```

## Backup

```text
/var/backups/stream-control-center/RDAP14B_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_DEPLOY_TEST_remote-modboard-backend_20260624_090046.tar.gz
```

## Bestaetigte Live-Routen

```text
GET /api/remote/lock-audit/status
GET /api/remote/lock-audit/status?db=1
GET /api/remote/lock-audit/schema-adapter/status
GET /api/remote/lock-audit/schema-adapter/status?db=1
```

## Bestaetigte Werte

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

OAuth:

```text
start=403
callback=403
```

## Adapter-Befund

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
