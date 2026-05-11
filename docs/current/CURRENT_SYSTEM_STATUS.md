# CURRENT_SYSTEM_STATUS - DeathCounter DB-Storage STABLE

Stand: 2026-05-11

## Wichtigster aktueller Projektstand

DeathCounter V2 läuft produktiv auf DB-Storage und ist nach Live-Test als stabil bestätigt.

```text
activeStorage: database
configuredStorage: database
fallbackStorage: json_backup_export_file
databaseReadable: true
dualWriteEnabled: false
jsonFallbackEnabled: true
```

## DeathCounter Verhalten

```text
readState(): DB-first
updateState(): DB-only
```

JSON wird nicht mehr automatisch bei jeder Änderung mitgeschrieben.

Backup/Export:

```text
!dcount backup
!dcount export
/api/deathcounter/v2/storage/backup
/api/deathcounter/v2/storage/export?mode=backup
/api/deathcounter/v2/storage/export?mode=export
```

## Bestätigt getestet

```text
/api/deathcounter/v2/status OK
/api/deathcounter/v2/settings OK
/api/deathcounter/v2/storage/read-test OK
/api/deathcounter/v2/storage/consistency OK
/api/deathcounter/v2/integration-check OK
/api/deathcounter/v2/storage/backup OK
/api/deathcounter/v2/storage/export?mode=export OK
!dcount backup über Command-API OK
!dcount export über Command-API OK
!rip + !del Schreibtest OK
```

## Aktive Referenzdokus

```text
docs/current/DEATHCOUNTER_DB_STORAGE_STABLE_2026-05-11.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/NEXT_STEPS.md
```

## Nicht geändert

```text
Overlay
Dashboard
Streamer.bot Actions
Command-API-Grundstruktur
app.sqlite wurde nicht ersetzt oder neu gebaut
```

## Hinweis

Die historische STEP-Kette 252-259 bleibt erhalten. Für den aktuellen Zustand zuerst diese Datei und `DEATHCOUNTER_DB_STORAGE_STABLE_2026-05-11.md` lesen.
