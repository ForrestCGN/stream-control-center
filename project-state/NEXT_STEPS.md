# NEXT_STEPS

Stand: RDAP33B_ADMIN_AUDIT_LOCK_SCHEMA_STATUS_READONLY_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Naechster empfohlener Step

```text
RDAP34_ADMIN_AUDIT_LOCK_SCHEMA_DECISION_OR_MIGRATION_PLAN
```

Ziel:

```text
Entscheiden, wie dashboard_audit_log fuer kuenftige Audit-Writes genutzt wird.
Keine Writes.
Keine DB-Migration ohne separaten bestaetigten Migrationsstep.
```

## Zu entscheiden

```text
Option A: vorhandenes Audit-Schema mappen.
Option B: dashboard_audit_log sanft erweitern, z. B. resource_type, error_code, safe_metadata_json, completed_at.
Option C: neue Parallelstruktur vermeiden, nur wenn zwingend noetig.
```

## Wichtig

```text
RDAP34 darf kein Audit-Testwrite-Step sein.
writesMayBeBuiltNow ist false.
Blocker: audit_write_candidate_columns_missing.
```

## Danach je nach Entscheidung

```text
RDAP35_ADMIN_AUDIT_SCHEMA_MIGRATION_PREPARED
```

oder:

```text
RDAP35_ADMIN_AUDIT_WRITE_MAPPING_CONFIRMED_PLAN
```
