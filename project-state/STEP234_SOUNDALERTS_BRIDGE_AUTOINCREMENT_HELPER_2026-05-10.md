# STEP234 – SoundAlerts Bridge DB-Helper-Cleanup – 2026-05-10

## Ziel

`backend/modules/soundalerts_bridge.js` nutzt im Schema keine direkte SQLite-`AUTOINCREMENT`-Schreibweise mehr, sondern den zentralen Core-DB-Helper.

## Betroffene Datei

- `backend/modules/soundalerts_bridge.js`

## Änderung

- `soundalerts_bridge_events.id` nutzt jetzt `database.primaryKeyAutoIncrementSql()`.
- `soundalerts_bridge_entries.id` nutzt jetzt `database.primaryKeyAutoIncrementSql()`.
- Direkte `INTEGER PRIMARY KEY AUTOINCREMENT`-Stellen wurden aus dem Modul entfernt.

## Bewusst nicht geändert

- Keine SoundAlerts-WebSocket-Logik.
- Keine SoundAlerts-Event-Verarbeitung.
- Keine Sound-System-Weiterleitung.
- Keine Entry-/Rule-/Mapping-Logik.
- Keine `ON CONFLICT(key)`- oder `ON CONFLICT(entry_key)`-Upserts.
- Keine Tabellenstruktur-Migration.
- Keine Datenmigration.
- Kein MySQL/MariaDB aktiv.
- Keine Änderung an `backend/core/database.js`.
- Keine Änderung an `backend/modules/sqlite_core.js`.

## Hinweise

SQLite bleibt produktiv aktiv. MySQL/MariaDB bleiben weiterhin nur vorbereitet. Die verbleibenden `ON CONFLICT`-Stellen enthalten funktionale Upsert-Logik und werden in diesem STEP nicht blind ersetzt.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\soundalerts_bridge.js
```

Empfohlene Live-Tests:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/soundalerts/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```
