# CURRENT_SYSTEM_STATUS - STEP259 Update

DeathCounter V2 läuft produktiv auf DB-Storage.

Aktueller Storage-Stand:

```text
activeStorage: database
dualWriteEnabled: false
jsonFallbackEnabled: true
```

Wichtig:

- Produktive DeathCounter-Änderungen werden in die DB geschrieben.
- `deathcounter.v2.json` wird nicht mehr automatisch bei jeder Änderung mitgeschrieben.
- JSON bleibt als Backup-/Exportformat erhalten.
- Manuelle Backups/Exports sind verfügbar:
  - `/api/deathcounter/v2/storage/backup`
  - `/api/deathcounter/v2/storage/export?mode=backup`
  - `/api/deathcounter/v2/storage/export?mode=export`
  - `!dcount backup`
  - `!dcount export`

Nicht geändert:

```text
Overlay
Dashboard
Streamer.bot Actions
Command-API-Grundstruktur
```
