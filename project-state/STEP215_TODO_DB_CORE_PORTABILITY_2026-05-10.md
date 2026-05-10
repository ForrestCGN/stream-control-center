# STEP215 - Todo DB-Core-Portabilitaet - 2026-05-10

## Ziel

`backend/modules/todo.js` wird von direkter `sqlite_core.js`-Nutzung auf die zentrale DB-Schicht `backend/core/database.js` umgestellt.

SQLite bleibt produktiver Standard. MySQL/MariaDB werden nicht aktiviert.

## Geaenderte Datei

```text
backend/modules/todo.js
```

## Was geaendert wurde

- `require("./sqlite_core")` durch `require("../core/database")` ersetzt.
- Initialisierung laeuft ueber `database.ensureReady(ctx)`.
- Todo-Schema laeuft ueber `database.ensureSchema(...)`.
- Todo-Stats-Zugriffe laufen ueber `database.run/get/all/transaction`.
- Status-/Integration-Check liest DB-Pfad und Schema-Version ueber `database.getDbPath()` und `database.getSchemaVersion(...)`.

## Bewusst nicht geaendert

- Keine Tabellenstruktur.
- Keine Datenmigration.
- Keine Todo-/Discord-/Alias-/Text-/Settings-/Stats-Logik.
- Kein `package.json`.
- Kein MySQL-/MariaDB-Treiber.
- Keine MySQL-/MariaDB-Verbindung.
- Keine Aenderung an `sqlite_core.js`.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\todo.js
```

API-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/config" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/stats" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/stats/today" | ConvertTo-Json -Depth 100
```

## Ergebnis

Todo ist fuer die spaetere DB-Portabilitaet vorbereitet, nutzt aber weiterhin produktiv SQLite ueber die zentrale DB-Schicht.
