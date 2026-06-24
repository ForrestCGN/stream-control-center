# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN
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
docs/current/RDAP12_LOCK_AUDIT_SCHEMA_COMPATIBILITY_PLAN.md
docs/current/RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN.md
```

## Aktueller bestaetigter Stand

```text
RDAP13_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_PLAN
```

RDAP13 dokumentiert den read-only Schema-Adapter-Plan fuer das reale Lock-/Audit-Schema.

RDAP13 ist reiner Doku-/Planungsstand:

- keine Backend-Codeaenderung
- keine DB-Aenderung
- keine Migration
- keine Writes
- kein Login
- kein OAuth
- keine Sessions
- keine Agent-Actions

## Wichtigster Befund

`dashboard_locks` und `dashboard_audit_log` existieren, weichen aber vom RDAP11-Erwartungsmodell ab.

RDAP13 plant deshalb Adapter/Mappings statt sofortiger Migration.

## Adapter-Ziel

Spaeter read-only erkennen:

- reale Tabellen
- vorhandene Spalten
- Mapping auf internes Modell
- fehlende Pflichtfelder
- `compatibleForRead`
- `compatibleForWrite`
- Gruende, warum Writes blockiert bleiben

## Naechster sinnvoller Schritt

```text
RDAP14_LOCK_AUDIT_SCHEMA_ADAPTER_READONLY_SKELETON
```

RDAP14 darf nur nach eigenem Scope und ausdruecklichem go umgesetzt werden.

## Server-Script-Regel

Nach `systemctl restart` immer Readiness-Wait/Retry vor API-Tests.

Keine sofortigen `curl`-Tests direkt nach Restart.
