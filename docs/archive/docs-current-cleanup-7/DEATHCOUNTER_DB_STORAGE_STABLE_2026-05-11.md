# DEATHCOUNTER DB STORAGE STABLE

Stand: 2026-05-11  
Status: STABLE nach Live-Test

## Kurzfazit

DeathCounter V2 wurde von JSON-State auf produktiven DB-Storage umgestellt.

Die API-Struktur blieb erhalten. Overlay und Streamer.bot mussten nicht angepasst werden.

## Produktiver Storage

```text
activeStorage: database
configuredStorage: database
fallbackStorage: json_backup_export_file
databaseReadable: true
dualWriteEnabled: false
jsonFallbackEnabled: true
```

## Produktives Verhalten

```text
readState(): DB-first
updateState(): DB-only
```

DeathCounter nutzt produktiv diese Tabellen:

```text
deathcounter_players
deathcounter_games
deathcounter_counts
deathcounter_overlay_state
deathcounter_events
```

Aktueller bestätigter Tabellenstand nach Import und Live-Test:

```text
deathcounter_players: 14
deathcounter_games: 24
deathcounter_counts: 199
deathcounter_overlay_state: 5
deathcounter_events: 0
```

`deathcounter_events` ist absichtlich leer. Historische Events wurden nicht künstlich aus `deathcounter.v2.json` rekonstruiert.

## JSON-Verhalten

`deathcounter.v2.json` wird nicht mehr automatisch bei jeder Änderung mitgeschrieben.

JSON ist jetzt nur noch Backup-/Exportformat:

```text
!dcount backup
→ erstellt data/deathcounter/backups/deathcounter.v2.export.<timestamp>.json

!dcount export
→ schreibt data/deathcounter/deathcounter.v2.json neu aus DB
→ legt vorher data/deathcounter/backups/deathcounter.v2.before-manual-export.<timestamp>.json an
```

API-Routen:

```text
GET/POST /api/deathcounter/v2/storage/backup
GET/POST /api/deathcounter/v2/storage/export?mode=backup
GET/POST /api/deathcounter/v2/storage/export?mode=export
```

## Wichtige DeathCounter Storage-Routen

```text
GET  /api/deathcounter/v2/storage/preview
GET  /api/deathcounter/v2/storage/validate
POST /api/deathcounter/v2/storage/import
GET  /api/deathcounter/v2/storage/consistency
GET  /api/deathcounter/v2/storage/read-test
GET  /api/deathcounter/v2/storage/backup
POST /api/deathcounter/v2/storage/backup
GET  /api/deathcounter/v2/storage/export
POST /api/deathcounter/v2/storage/export
```

## Bestätigte Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/read-test?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/consistency?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/backup" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/export?mode=export" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&input0=backup&sendChat=0" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/command?command=dcount&input0=export&sendChat=0" | ConvertTo-Json -Depth 20
```

Echter Schreibtest:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/rip?player=forrestcgn&delta=1" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/consistency?includeIssues=false" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/del?player=forrestcgn&delta=1" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/consistency?includeIssues=false" | ConvertTo-Json -Depth 20
```

## Nicht geändert

```text
htdocs/overlays/_overlay-deathcounter-v2.html
htdocs/dashboard/modules/deathcounter.js
htdocs/dashboard/modules/deathcounter.css
Streamer.bot Actions/Exports
```

## Nächste sinnvolle DeathCounter-Arbeit

Nicht sofort am Storage-Grundsystem weiterbauen.

Sinnvoll wären später nur gezielte Erweiterungen:

```text
- deathcounter_events künftig live befüllen
- Dashboard-Ansicht für DB-Storage/Backups
- Backup-Liste/Download im Dashboard
- Reporting/Statistik aus DB
```
