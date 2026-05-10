# STEP231 - TTS System DB Helper Cleanup - 2026-05-10

## Ziel

`backend/modules/tts_system.js` reduziert direkte SQLite-nahe Schema-SQL-Stellen. SQLite bleibt produktiv aktiv; MySQL/MariaDB werden dadurch nicht aktiviert.

## Geaendert

- `tts_events.id` nutzt im Schema jetzt `database.primaryKeyAutoIncrementSql()`.
- Die direkte `INTEGER PRIMARY KEY AUTOINCREMENT`-Stelle wurde aus `tts_system.js` entfernt.

## Bewusst nicht geaendert

- Keine TTS-Fachlogik.
- Keine Google-/Piper-/Voice-Logik.
- Keine Sound-System-/Queue-/Overlay-Logik.
- Keine Tabellenstruktur-Migration.
- Keine Datenmigration.
- Kein MySQL/MariaDB aktiv.
- Keine Aenderung an `backend/core/database.js`.
- Keine Aenderung an `backend/modules/sqlite_core.js`.

## Bewusst offen gelassen

Die beiden `ON CONFLICT`-Stellen in `tts_system.js` bleiben absichtlich unveraendert:

- `tts_usage_daily`: nutzt inkrementelle Summen mit `excluded.*`.
- `tts_events`: nutzt `COALESCE(excluded.started_at, started_at)` und `COALESCE(excluded.finished_at, finished_at)`.

Diese Upserts enthalten Sonderlogik und werden nicht blind auf einen generischen Helper umgestellt.

## Syntaxcheck

```powershell
node --check backend\modules\tts_system.js
```

## Testvorschlag

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```
