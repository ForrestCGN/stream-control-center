# STEP214 - Tagebuch DB-Core-Portabilitaet

Stand: 2026-05-10

## Ziel

`backend/modules/tagebuch.js` wird von direkter `sqlite_core.js`-Nutzung auf die zentrale DB-Schicht `backend/core/database.js` umgestellt.

SQLite bleibt weiterhin der aktive produktive Adapter. MySQL/MariaDB werden nicht aktiviert.

## Geaendert

- `const sqlite = require(path.join(__dirname, 'sqlite_core.js'));` wurde durch `const database = require('../core/database');` ersetzt.
- `init(ctx)` ruft jetzt `database.ensureReady(ctx)` auf, bevor Runtime-Config, Messages und Schema geladen werden.
- Direkte `sqlite.*`-Aufrufe wurden auf `database.*` umgestellt:
  - `ensureSchema`
  - `get`
  - `run`
  - `all`
  - `getSchemaVersion`
  - `getDbPath`
- Die bestehende Schema-Migration bleibt fachlich unveraendert.
- Der Migrations-Callback nutzt weiterhin das von `database.ensureSchema()` uebergebene `db`-Objekt.

## Bewusst nicht geaendert

- Keine Tabellenstruktur.
- Keine Datenmigration.
- Keine Discord-/Webhook-Logik.
- Keine Tagebuch-Textlogik.
- Keine Streamstart-/Streamende-Logik.
- Keine Stats-Logik.
- Keine Reset-Logik.
- Kein `package.json`.
- Kein MySQL-/MariaDB-Treiber.
- Keine MySQL-/MariaDB-Verbindung.
- Keine Aenderung an `backend/modules/sqlite_core.js`.

## Betroffene Dateien

```text
backend/modules/tagebuch.js
project-state/STEP214_TAGEBUCH_DB_CORE_PORTABILITY_2026-05-10.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Test

Syntaxcheck:

```powershell
node --check backend\modules	agebuch.js
```

Live/API-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/config" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/settings" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/routes" | ConvertTo-Json -Depth 100
```

Optional, falls Stats aktiv sind:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/stats/top" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/stats/today" | ConvertTo-Json -Depth 100
```

## Erwartung

- `ok = true`.
- `databasePath` zeigt weiter auf `D:\Streaming\stramAssets\data\sqlitepp.sqlite`.
- `schemaVersion = 5`.
- Keine neue DB-Datei.
- Keine MySQL-/MariaDB-Verbindung.
