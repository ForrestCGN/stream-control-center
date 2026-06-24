# START HERE FOR NEW CHAT - stream-control-center / Remote Dashboard Agent Planung

Stand: RDAP15_LOCK_RESOURCE_TYPE_DECISION_PLAN
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
docs/current/RDAP14C_LOCK_AUDIT_SCHEMA_ADAPTER_LIVE_TEST_DOCS.md
docs/current/RDAP15_LOCK_RESOURCE_TYPE_DECISION_PLAN.md
```

## Aktueller bestaetigter Stand

```text
RDAP15_LOCK_RESOURCE_TYPE_DECISION_PLAN
```

RDAP15 dokumentiert die Entscheidung fuer den Umgang mit `resourceType` bei spaeteren Lock-Writes.

RDAP15 ist reiner Doku-/Planungsstand:

- keine Backend-Codeaenderung
- keine DB-Aenderung
- keine Migration
- keine Writes
- kein Login
- kein OAuth
- keine Sessions
- keine Agent-Actions

## Entscheidung RDAP15

Empfehlung:

```text
Hybrid
```

Kurzfristig:

```text
resource_key muss typisiert sein: <resourceType>:<namespace>:<id>
```

Mittelfristig:

```text
resource_type als eigene Spalte per Migration planen, aber nur mit eigenem Scope, Backup und Rollback.
```

## Warum

RDAP14C bestaetigte:

```text
locks.compatibleForRead=true
locks.compatibleForWrite=false
missingForWrite=["resourceType"]
writeBlockReason=resource_type_column_missing_typed_resource_key_required_and_writes_disabled
```

## Verbindliche Resource-Key-Regel ab RDAP15

Neue Lock-Konzepte muessen Resource-Keys so planen:

```text
text:message:welcome
config:module:loyalty
media:sound:1602
overlay:layout:event_winner
command:twitch:clip
```

Nicht mehr akzeptabel fuer neue Lock-Konzepte:

```text
welcome
loyalty
1602
event_winner
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

## Strukturregel

Wenn fachlich passend, vorhandene Module/Services/Routen erweitern statt neue Module anzulegen.

## Server-Script-Regel

Nach `systemctl restart` immer Readiness-Wait/Retry vor API-Tests.

## Naechster sinnvoller Schritt

```text
RDAP16_TYPED_RESOURCE_KEY_RULES_AND_ADAPTER_PLAN
```
