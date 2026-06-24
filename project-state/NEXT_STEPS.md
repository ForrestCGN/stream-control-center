# NEXT STEPS - stream-control-center

Stand: RDAP14C_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_TEST_DOCS
Datum: 2026-06-24

## Naechster sinnvoller Schritt

```text
RDAP15_LOCK_RESOURCE_TYPE_DECISION_PLAN
```

## Ziel RDAP15

Planen, wie `resourceType` fuer spaetere Lock-Writes behandelt werden soll.

Grund:

```text
locks.compatibleForWrite=false
missingForWrite=["resourceType"]
```

Optionen:

1. Migration: `dashboard_locks.resource_type` ergaenzen
2. Kein Schema-Change: `resource_key` zwingend typisiert nutzen
3. Hybrid: `resource_type` spaeter ergaenzen, bis dahin typisierte `resource_key`

## RDAP15 darf NICHT

- Tabellen aendern
- Migration ausfuehren
- DB-Writes ausfuehren
- Login aktivieren
- OAuth aktivieren
- Cookies/Sessions bauen
- Remote-Writes bauen
- Agent-Actions aktivieren
- Secrets ausgeben oder loggen

## Server-Regel

Bei jedem Server-Restart:

- `systemctl restart`
- Readiness-Wait/Retry
- erst danach API-Tests
