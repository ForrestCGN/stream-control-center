# STEP233 – Tagebuch DB-Helper-Cleanup

Datum: 2026-05-10

## Ziel

`backend/modules/tagebuch.js` weiter von direkten SQLite-SQL-Konstrukten entkoppeln, ohne Tagebuch-Fachlogik zu ändern.

## Geänderte Dateien

- `backend/modules/tagebuch.js`

## Änderungen

- `tagebuch_runtime_events.id` nutzt im Schema jetzt `database.primaryKeyAutoIncrementSql()`.
- `saveState(...)` nutzt jetzt `database.upsert(...)` statt direktem `ON CONFLICT(id)`.
- Die Tagebuch-State-Tabelle bleibt unverändert.
- SQLite bleibt aktiver Adapter.
- MySQL/MariaDB bleiben vorbereitet, aber inaktiv.

## Bewusst nicht geändert

- Keine Tagebuch-Fachlogik.
- Keine Discord-/Webhook-Logik.
- Keine Streamstart-/Streamende-Logik.
- Keine Stats-Logik.
- Keine Tabellenstruktur-Migration.
- Keine Datenmigration.
- Keine Änderung an `backend/core/database.js`.
- Keine Änderung an `backend/modules/sqlite_core.js`.

## Bewusst nicht ersetzt

Diese Stellen bleiben absichtlich erhalten:

- `ON CONFLICT(user_key)` in `updateUserStats(...)`
- `ON CONFLICT(page_date, user_key)` in `updateUserStats(...)`

Grund: Dort wird `entry_count` inkrementiert und mit `COALESCE(NULLIF(...))` vorhandene User-Daten geschützt. Das ist Sonderlogik und darf nicht blind durch einen generischen Upsert ersetzt werden.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\tagebuch.js
```

Empfohlene Live-Tests:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/config" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/stats/top" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```
