# STEP218 - DB Dialect Helper Phase 2 Plan

Stand: 2026-05-10
Projekt: stream-control-center
Bereich: Datenbank-Portabilitaet / MySQL-MariaDB-Vorbereitung

## Ziel

Dieser STEP plant Phase 2 der DB-Portabilitaet.

Phase 1 hat die direkte produktive Kopplung vieler Module an `backend/modules/sqlite_core.js` reduziert. Die Module laufen weiterhin produktiv auf SQLite, aber nun ueber `backend/core/database.js`.

Phase 2 soll nicht MySQL/MariaDB aktivieren, sondern SQLite-nahe SQL-Konstrukte schrittweise zentral kapseln.

## Weiterhin verbindlich

- SQLite bleibt produktiver Standard.
- `D:\Streaming\stramAssets\data\sqlite\app.sqlite` bleibt die aktive Datenbank.
- MySQL/MariaDB werden vorbereitet, aber nicht genutzt.
- Kein MySQL-/MariaDB-Treiber wird installiert.
- Keine bestehende SQLite-Funktionalitaet wird fuer theoretische Portabilitaet gebrochen.
- Keine Datenbank wird neu gebaut, ersetzt oder ueberschrieben.
- Schemaaenderungen nur sanft und ohne Datenverlust.

## Ausgangslage nach Phase 1

Bereits auf `backend/core/database.js` gefuehrte Module:

- `backend/modules/kofi.js`
- `backend/modules/tipeee.js`
- `backend/modules/twitch.js`
- `backend/modules/sound_system.js`
- `backend/modules/dashboard_auth.js`
- `backend/modules/alert_system.js`
- `backend/modules/tagebuch.js`
- `backend/modules/todo.js`
- `backend/modules/challenge.js`

Korrekt weiterhin SQLite-nahe Kernstellen:

- `backend/core/database.js`
- `backend/modules/sqlite_core.js`

Technischer Sonderfall:

- `backend/check_alert_db.js`
  - altes Pruefscript
  - direkter `DatabaseSync`-Zugriff
  - nicht als normales produktives Modul behandeln

## Problemklasse Phase 2

Im Code existieren weiterhin SQLite-nahe SQL-Konstrukte:

```sql
INTEGER PRIMARY KEY AUTOINCREMENT
INSERT OR IGNORE
ON CONFLICT(...)
PRAGMA table_info(...)
```

Diese sind fuer den aktuellen SQLite-Betrieb korrekt. Fuer spaetere MySQL-/MariaDB-Unterstuetzung sollen sie aber schrittweise ueber `backend/core/database.js` gekapselt werden.

## Bereits vorhandene Helper in backend/core/database.js

`backend/core/database.js` enthaelt bereits erste Helper:

- `primaryKeyAutoIncrementSql()`
- `textTypeSql()`
- `integerTypeSql()`
- `realTypeSql()`
- `boolTypeSql()`
- `dateTimeTypeSql()`
- `jsonTypeSql()`
- `buildInsertSql()`
- `buildUpsertSql()`
- `insert()`
- `upsert()`
- `upsertByKey()`
- `columnExists()`
- `quoteIdentifier()`

Diese Helper sind fuer Phase 2 die Basis, duerfen aber nur schrittweise in Modulen verwendet werden.

## Reihenfolge Phase 2

### STEP219 - Helper-Stabilisierung ohne Modulumbau

Ziel:

- `backend/core/database.js` um kleine, sichere Zusatzhelper erweitern.
- Keine Module umbauen.
- Keine DB-Migration.

Moegliche Helper:

- `tableInfo(tableName)`
- `ensureColumn(tableName, columnName, definition)`
- `buildCreateTableSql(name, columns)` nur falls wirklich sinnvoll
- klarere Aliase fuer `primaryKeyAutoIncrementSql()`
- kleine Tests/Smoke-Checks fuer die vorhandenen Helper

Bewusst nicht:

- kein MySQL-/MariaDB-Adapter
- kein Treiber
- keine Modulportierung

### STEP220 - Kleines Modul auf vorhandene Helper umstellen

Kandidat:

- `backend/modules/kofi.js` oder `backend/modules/tipeee.js`

Ziel:

- einfache `INSERT ... ON CONFLICT`-Stellen ueber `database.upsert(...)` kapseln.
- keine Tabellenstruktur veraendern.
- identisches SQLite-Verhalten behalten.

### STEP221 - `PRAGMA table_info`-Stellen kapseln

Kandidaten:

- `dashboard_auth.js`
- `alert_system.js`
- `tagebuch.js`
- `hug.js`
- `helper_texts.js`

Ziel:

- direkte `PRAGMA table_info(...)`-Abfragen durch `database.columnExists(...)` oder neuen `database.tableInfo(...)`-Helper ersetzen.
- Kein Verhalten aendern.

### STEP222+ - DDL-Konstrukte schrittweise kapseln

Ziel:

- `INTEGER PRIMARY KEY AUTOINCREMENT` nicht mehr hart in neuen oder refactorten Tabellen verwenden.
- Vorhandene SQL-DDL nur dann anfassen, wenn das Modul klein und gut testbar ist.
- Grosse Systeme nicht komplett auf einmal umbauen.

## Wichtige Bewertung

Das direkte Ersetzen aller SQL-Konstrukte in allen Modulen waere riskant.

Warum:

- Viele Schemas sind produktiv aktiv.
- Einige Module haben alte Kompatibilitaetsspalten.
- `ensureSchema(...)` nutzt aktuell weiterhin den SQLite-Callback mit direktem `db.exec/db.prepare`.
- MySQL/MariaDB ist noch nicht aktiv, daher darf keine Portabilitaets-Theorie produktive SQLite-Funktionalitaet verschlechtern.

## Minimaltests pro zukuenftigem Phase-2-Code-STEP

Immer:

```powershell
node --check backend\core\database.js
```

Bei Modulumbau zusaetzlich:

```powershell
node --check backend\modules\<modul>.js
```

Dazu die jeweiligen API-Status-/Integration-Routen des Moduls.

## Nicht-Ziele fuer Phase 2

- Kein produktiver DB-Wechsel.
- Kein MariaDB-Testserver erforderlich.
- Kein MySQL-/MariaDB-Treiber.
- Keine Migration von `app.sqlite`.
- Keine Aenderung an Secrets oder `.env`.
- Kein Loeschen von `sqlite_core.js`.
- Kein Entfernen alter Legacy-Routen.

## Empfehlung fuer den naechsten echten Code-STEP

Naechster sinnvoller Schritt:

```text
STEP219: backend/core/database.js Helper-Stabilisierung fuer Phase 2
```

Betroffene Datei voraussichtlich:

```text
backend/core/database.js
project-state/STEP219_DB_CORE_HELPER_STABILIZATION_2026-05-10.md
project-state/*
docs/current/CURRENT_SYSTEM_STATUS.md
```

Bewusst nicht betroffen:

```text
backend/modules/*.js
package.json
app.sqlite
sqlite_core.js
```

