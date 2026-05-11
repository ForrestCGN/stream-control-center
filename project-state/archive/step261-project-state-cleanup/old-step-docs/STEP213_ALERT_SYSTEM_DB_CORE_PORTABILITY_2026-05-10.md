# STEP213 - Alert-System DB-Core-Portabilitaet

Stand: 2026-05-10

## Ziel

`backend/modules/alert_system.js` wurde von direkter `sqlite_core.js`-Nutzung auf die zentrale DB-Schicht `backend/core/database.js` umgestellt.

SQLite bleibt weiterhin produktiver Standard. MySQL/MariaDB werden nicht aktiv genutzt.

## Betroffene Datei

```text
backend/modules/alert_system.js
```

## Geaendert

- Import von `./sqlite_core` auf `../core/database` umgestellt.
- Runtime-Initialisierung von `sqlite.isInitialized()/sqlite.init(ctx)` auf `database.ensureReady(ctx)` umgestellt.
- Direkte DB-Aufrufe im Modul laufen jetzt ueber:
  - `database.ensureSchema`
  - `database.exec`
  - `database.run`
  - `database.get`
  - `database.all`
  - `database.getDbPath`
  - `database.getSchemaVersion`
- Alert-Regeln, Assets, Settings, Events, Display-Profile, Textvarianten, Test-Presets und Chat-Outbox bleiben funktional unveraendert.
- Die bestehenden SQLite-DDL-Statements innerhalb der Migration bleiben in diesem STEP bewusst unveraendert.

## Bewusst nicht geaendert

- Keine Tabellenstruktur.
- Keine Datenmigration.
- Kein MySQL-/MariaDB-Treiber.
- Keine MySQL-/MariaDB-Verbindung.
- Keine Queue-/Overlay-/Dashboard-/Provider-Logik.
- Keine Upload-/Asset-Logik.
- Keine Alert-Regel-Logik.
- Keine Chat-Outbox-Logik.
- Keine Aenderung an `backend/modules/sqlite_core.js`.
- Keine Aenderung an `package.json`.

## Einordnung

Dieser STEP reduziert die direkte Kopplung des Alert-Systems an `sqlite_core.js`.

Die aktive Laufzeit bleibt:

```text
alert_system.js -> backend/core/database.js -> sqlite_core.js -> data/sqlite/app.sqlite
```

## Technische Hinweise

Im Modul existieren weiterhin SQLite-nahe SQL-Konstrukte wie:

```text
INTEGER PRIMARY KEY AUTOINCREMENT
ON CONFLICT(...)
PRAGMA table_info(...)
```

Diese bleiben fuer den aktuellen SQLite-Betrieb bestehen. Eine echte MySQL-/MariaDB-Portierung der DDL-/Upsert-Syntax ist ein spaeterer separater Schritt, nachdem alle relevanten Module ueber `backend/core/database.js` laufen.

## Syntaxcheck

```powershell
node --check backend\modules\alert_system.js
```

Erwartung:

```text
kein Output / Exit Code 0
```

## Live-Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/health" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/rules" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/assets" | ConvertTo-Json -Depth 100
```

Wichtig:

- `ok = true`
- `databasePath` zeigt weiter auf `D:\Streaming\stramAssets\data\sqlite\app.sqlite`
- keine Fehler in Health/Status
- bestehende Regeln und Assets werden weiterhin gelesen
