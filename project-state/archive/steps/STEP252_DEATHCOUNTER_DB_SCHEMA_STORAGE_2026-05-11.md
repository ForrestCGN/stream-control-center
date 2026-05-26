# STEP252 - DeathCounter DB-Schema Storage-Grundlage

Stand: 2026-05-11

## Ziel

DeathCounter V2 bekommt eine vorbereitete DB-Storage-Grundlage, ohne die produktive JSON-State-Logik umzuschalten.

## Produktiver Stand bleibt

```text
data/deathcounter/deathcounter.v2.json
```

Diese Datei bleibt Single Source of Truth für Counts, Spieler, Game-State und Overlay-State.

## Geändert

```text
backend/modules/deathcounter_v2.js
```

Neue vorbereitete Storage-Konstanten:

```text
STORAGE_SCHEMA_MODULE = deathcounter_v2_storage
STORAGE_SCHEMA_VERSION = 1
```

Neue vorbereitete Tabellen:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

## Neue interne Funktionen

```text
ensureDeathcounterStorageSchema()
buildDeathcounterStorageStatus()
```

## API-Auswirkungen

Erweitert:

```text
GET /api/deathcounter/v2/config
GET /api/deathcounter/v2/settings
GET /api/deathcounter/v2/integration-check
```

Der Integration-Check enthält jetzt zusätzlich:

```text
database_storage_schema
```

## Bewusst nicht gemacht

```text
- keine Count-Migration
- kein Import aus deathcounter.v2.json in die DB
- kein Umschalten von readState/writeState
- keine Änderung an RIP/DEL/TODE
- keine Änderung am Overlay
- keine Änderung an Streamer.bot
- keine Änderung an app.sqlite als Datei selbst
```

## Test

Nach Einbau und Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```

Erwartung:

```text
checks[].name = database_storage_schema
level = ok
activeStorage = json_state_file
preparedStorage = database_schema
migrationPerformed = false
countsImported = false
```

## Nächster sinnvoller Step

```text
STEP253: optionaler read-only Snapshot/Export aus JSON in DB-Struktur, weiterhin ohne produktive Umstellung
```
