# CURRENT STATUS - stream-control-center

Stand: RDAP15_LOCK_RESOURCE_TYPE_DECISION_PLAN
Datum: 2026-06-24

## Aktueller bestaetigter Arbeitsstand

RDAP15 dokumentiert die Entscheidungsvorbereitung fuer `resourceType` bei spaeteren Lock-Writes.

RDAP15 ist ein reiner Doku-/Planungsstand.

Keine Code-, DB- oder Server-Aenderung.

## Ausgangslage

RDAP14C bestaetigte live:

```text
locks.compatibleForRead=true
locks.compatibleForWrite=false
missingForWrite=["resourceType"]
writeBlockReason=resource_type_column_missing_typed_resource_key_required_and_writes_disabled
```

## Entscheidung

Empfohlen wird Hybrid:

1. kurzfristig typisierte `resource_key` verwenden
2. mittelfristig `resource_type` als eigene Spalte planen
3. produktive Lock-Writes bleiben blockiert, bis alle Safety-/Auth-/Permission-/Audit-/Schema-Gates stehen

## Verbindliche Resource-Key-Regel

Format:

```text
<resourceType>:<namespace>:<id>
```

Beispiele:

```text
text:message:welcome
config:module:loyalty
media:sound:1602
overlay:layout:event_winner
command:twitch:clip
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
