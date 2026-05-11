# STEP259 - DeathCounter DB-only Storage + manueller JSON Backup/Export

Stand: 2026-05-11

## Ziel

DeathCounter bleibt produktiv auf Datenbank-Storage, schreibt aber nicht mehr bei jeder Änderung automatisch parallel in `deathcounter.v2.json`.

JSON bleibt als manuelles Backup-/Exportformat erhalten.

## Geändert

- `readState()` bleibt DB-first mit JSON-Fallback, falls DB nicht lesbar ist.
- `updateState()` schreibt produktive Änderungen nur noch in die DB.
- Automatischer JSON-Dual-Write wurde entfernt.
- Neue manuelle Export-/Backup-Routen:
  - `GET/POST /api/deathcounter/v2/storage/backup`
  - `GET/POST /api/deathcounter/v2/storage/export?mode=backup`
  - `GET/POST /api/deathcounter/v2/storage/export?mode=export`
- Neue Commands über vorhandene Command-API:
  - `!dcount backup`
  - `!dcount export`

## Verhalten

```text
!dcount backup
→ erstellt eine neue Timestamp-Datei unter data/deathcounter/backups/

!dcount export
→ schreibt den aktuellen DB-Stand in data/deathcounter/deathcounter.v2.json
→ legt vorher ein Backup der alten Haupt-JSON unter data/deathcounter/backups/ an
```

## Bewusst nicht geändert

- keine DB neu gebaut
- keine Counts gelöscht
- keine Overlay-Änderung
- keine Streamer.bot-Änderung
- kein optionaler Storage-Schalter
- JSON-Datei nicht entfernt

## Tests

```text
node --check backend/modules/deathcounter_v2.js
```

Empfohlene Live-Tests:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/backup" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/storage/export?mode=export" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/deathcounter/v2/integration-check" | ConvertTo-Json -Depth 20
```
