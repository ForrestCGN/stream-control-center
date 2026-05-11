# STEP223 - helper_settings DB-Helper-Cleanup (2026-05-10)

## Ziel

`backend/modules/helpers/helper_settings.js` soll keine direkte `INSERT OR IGNORE`-SQL-Stelle mehr enthalten, sondern den zentralen DB-Helper aus `backend/core/database.js` nutzen.

## Betroffene Datei

- `backend/modules/helpers/helper_settings.js`

## Geändert

- `seedDefaults(...)` nutzt jetzt `database.insertIgnore(...)` statt manuell gebautem `INSERT OR IGNORE INTO ...`.
- Die bestehende Settings-Tabellenlogik bleibt unverändert.
- Die Rückgabe `inserted` basiert weiterhin auf `result.changes`.

## Bewusst nicht geändert

- Keine Tabellenstruktur.
- Keine Datenmigration.
- Keine Settings-Logik.
- Keine Config-Fallback-Logik.
- Kein MySQL/MariaDB aktiv.
- Keine Änderung an `backend/core/database.js`.
- Keine Änderung an `backend/modules/sqlite_core.js`.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\helpers\helper_settings.js
```

Empfohlene API-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

## Bewertung

Kleiner Phase-2-Cleanup. SQLite bleibt produktiv aktiv. MySQL/MariaDB werden weiterhin nur vorbereitet, aber nicht genutzt.
