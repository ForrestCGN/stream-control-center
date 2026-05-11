# STEP219 - DB Core Helper-Stabilisierung

Stand: 2026-05-10

## Ziel

Dieser STEP stabilisiert `backend/core/database.js` fuer Phase 2 der DB-Portabilitaet.

SQLite bleibt weiterhin der einzige aktive produktive Adapter. MySQL und MariaDB bleiben vorbereitet, werden aber nicht verbunden, nicht installiert und nicht genutzt.

## Betroffene Datei

- `backend/core/database.js`

## Geaendert

In `backend/core/database.js` wurden zentrale Helper ergaenzt:

- `buildInsertIgnoreSql(table, data)`
- `insertIgnore(table, data)`
- `tableInfo(tableName)`
- `tableColumns(tableName)`
- `tableExists(tableName)`
- `buildAddColumnSql(tableName, columnName, definition)`
- `addColumn(tableName, columnName, definition)`
- `ensureColumn(tableName, columnName, definition)`

Zusaetzlich wurde `columnExists(tableName, columnName)` intern auf `tableInfo(...)` umgestellt, damit die Spaltenpruefung zentraler laeuft.

## Bewusst nicht geaendert

- keine Module portiert
- keine Tabellenstruktur geaendert
- keine Datenmigration ausgefuehrt
- kein `package.json` geaendert
- kein MySQL-/MariaDB-Treiber eingebaut
- keine MySQL-/MariaDB-Verbindung aktiviert
- keine Aenderung an `backend/modules/sqlite_core.js`
- keine produktive Umschaltung weg von SQLite

## Zweck der Helper

Diese Helper schaffen die Grundlage, um spaeter schrittweise SQLite-nahe Stellen aus Modulen herauszuziehen:

- direkte `PRAGMA table_info(...)`-Pruefungen
- direkte `ALTER TABLE ... ADD COLUMN ...`-Stellen
- direkte `INSERT OR IGNORE`-Stellen
- manuelle Tabellen-/Spaltenchecks

## Wichtig

Dieser STEP macht das Projekt noch nicht MySQL-/MariaDB-faehig. Er bereitet nur die zentrale Kapselung weiter vor.

Aktueller produktiver Pfad bleibt:

```text
Module -> backend/core/database.js -> backend/modules/sqlite_core.js -> data/sqlite/app.sqlite
```

## Test

Syntaxcheck:

```powershell
node --check backend\core\database.js
```

Empfohlene API-Checks nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/todo/status" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/challenge/status" | ConvertTo-Json -Depth 80
```

## Naechster sinnvoller STEP

STEP220 sollte ein kleines Modul oder einen kleinen Bereich nehmen und dort direkte Spalten-/PRAGMA-Checks auf `database.tableInfo(...)`, `database.columnExists(...)` oder `database.ensureColumn(...)` umstellen.

Nicht alles auf einmal umbauen.
