# CHANGELOG

## 2026-05-11 - STEP259 DeathCounter DB-only Storage + manueller JSON Backup/Export

- Automatischen JSON-Dual-Write aus `updateState()` entfernt.
- DeathCounter schreibt produktiv nur noch in die DB.
- JSON bleibt als Backup-/Exportformat erhalten.
- Neue API-Routen ergänzt:
  - `/api/deathcounter/v2/storage/backup`
  - `/api/deathcounter/v2/storage/export`
- Neue `!dcount`-Commands ergänzt:
  - `!dcount backup`
  - `!dcount export`
- Integration-Check zeigt `dualWriteEnabled: false`.
- Keine Overlay-, Dashboard- oder Streamer.bot-Änderung.
