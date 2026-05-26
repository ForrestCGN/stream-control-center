# STEP229 – Clips DB Helper Cleanup – 2026-05-10

## Ziel

`backend/modules/clips.js` reduziert eine weitere SQLite-nahe SQL-Stelle.

Dieser STEP ersetzt nur die direkte `INTEGER PRIMARY KEY AUTOINCREMENT`-Definition im Clip-History-Schema durch den zentralen Core-Helper.

## Betroffene Dateien

- `backend/modules/clips.js`

## Änderung

- `id INTEGER PRIMARY KEY AUTOINCREMENT` wurde ersetzt durch:

```js
id ${database.primaryKeyAutoIncrementSql()},
```

Damit wird die Autoincrement-Definition zentral über `backend/core/database.js` gekapselt.

## Bewusst nicht geändert

- keine Clip-Create-Logik
- keine Clip-History-Logik
- keine Replay-/OBS-Logik
- keine Discord-Posting-Logik
- keine Twitch-API-Logik
- keine Tabellenstruktur-Migration
- keine Datenmigration
- kein MySQL/MariaDB aktiv
- keine Änderung an `backend/core/database.js`
- keine Änderung an `backend/modules/sqlite_core.js`

## Erwartetes Verhalten

SQLite bleibt produktiv aktiv. Für SQLite erzeugt `database.primaryKeyAutoIncrementSql()` weiterhin:

```sql
INTEGER PRIMARY KEY AUTOINCREMENT
```

Damit darf sich am aktuellen Verhalten nichts ändern.

## Tests

Syntaxcheck:

```powershell
node --check backend\modules\clips.js
```

Empfohlene Live-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/routes" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/clip/integration-check" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
```

## Commit

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "db: use core autoincrement helper in clips"
```
