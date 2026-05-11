# CHANGELOG

## 2026-05-11 - STEP260 DeathCounter DB-Storage STABLE dokumentiert

- DeathCounter-DB-Umbau als stabilen Stand dokumentiert.
- Bestätigte Live-Tests für DB-only Betrieb, Backup, Export und Command-API eingetragen.
- Neue stabile Current-Doku ergänzt: `docs/current/DEATHCOUNTER_DB_STORAGE_STABLE_2026-05-11.md`.
- `PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md` wieder als vollständige Projektkarte geführt und DeathCounter-DB-Stand ergänzt.
- `PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md` wieder als vollständige Route-Map geführt und DeathCounter-Storage-Routen ergänzt.
- `PROJECT_DOCUMENTATION_MAP_2026-05-11.md` und `PROJECT_CLEANUP_PLAN_2026-05-11.md` nachgezogen.
- Keine Code-, DB-, Overlay-, Dashboard- oder Streamer.bot-Änderung.

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
