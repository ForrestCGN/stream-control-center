# STEP208 - DB Core Dialect Helper Vorbereitung

Stand: 2026-05-10

## Ziel

Dieser STEP bereitet die zentrale Datenbank-Schicht technisch auf spaetere MySQL-/MariaDB-Unterstuetzung vor, ohne den produktiven SQLite-Betrieb zu veraendern.

SQLite bleibt weiterhin der einzige aktive und produktiv genutzte Adapter.

## Hintergrund

Der vorherige DB-Portabilitaets-Scan zeigte:

- `backend/core/database.js` existiert bereits als zentrale DB-Schicht.
- Mehrere neue Module nutzen bereits `backend/core/database.js`.
- Mehrere aeltere/groessere Module nutzen noch direkt `backend/modules/sqlite_core.js`.
- Im Projekt existieren noch SQLite-nahe SQL-Konstrukte wie:
  - `INTEGER PRIMARY KEY AUTOINCREMENT`
  - `INSERT OR IGNORE`
  - `ON CONFLICT(...)`
  - `PRAGMA table_info(...)`
  - `DatabaseSync`

Darum wird MySQL/MariaDB noch nicht aktiv genutzt. Zuerst muessen zentrale Helper bereitstehen und Module schrittweise von direkter SQLite-Kopplung weggefuehrt werden.

## Geaendert

Datei:

```text
backend/core/database.js
```

Neue/erweiterte Vorbereitung:

- `DB_ADAPTER=mysql` wird als geplanter Adapter erkannt.
- `DB_ADAPTER=mariadb` wird als geplanter Adapter erkannt.
- SQLite bleibt Default und produktiv aktiv.
- MySQL/MariaDB oeffnen noch keine Verbindung.
- MySQL/MariaDB werfen weiterhin bewusst `adapter_not_implemented` bzw. `<adapter>_adapter_not_implemented_yet`.
- `status()` zeigt jetzt die gemeinsame MySQL-/MariaDB-Zielfamilie als `mysqlFamily`.

Neue zentrale Helper:

```text
normalizeAdapterName()
getDialectForAdapter()
isMysqlFamilyDialect()
isSqliteDialect()
getDatabaseFamily()
primaryKeyAutoIncrementSql()
textTypeSql()
integerTypeSql()
realTypeSql()
boolTypeSql()
dateTimeTypeSql()
jsonTypeSql()
nowSql()
buildUpsertSql()
upsert()
columnExists()
```

Bestehende Helper bleiben erhalten:

```text
buildInsertSql()
insert()
updateByKey()
upsertByKey()
count()
quoteIdentifier()
normalizeBool()
boolFromDb()
jsonEncode()
jsonDecode()
```

## Bewusst nicht geaendert

- Kein `package.json`-Eintrag fuer `mysql2` oder `mariadb`.
- Kein aktiver MySQL-/MariaDB-Adapter.
- Keine Verbindung zu MySQL/MariaDB.
- Keine Umstellung von produktiven Modulen.
- Keine Migration von `app.sqlite`.
- Keine Aenderung an `backend/modules/sqlite_core.js`.
- Keine Datenbankdatei erzeugt, ueberschrieben oder ersetzt.

## Architektur-Entscheidung

MySQL und MariaDB werden langfristig beide unterstuetzt, aber nicht als zwei komplett getrennte Welten geplant.

Zielstruktur:

```text
DB_ADAPTER=sqlite   -> SQLite Adapter
DB_ADAPTER=mysql    -> spaeterer MySQL-Family Adapter
DB_ADAPTER=mariadb  -> spaeterer MySQL-Family Adapter
```

Technisch soll spaeter ein gemeinsamer MySQL-Family-Adapter entstehen. Unterschiede zwischen MySQL und MariaDB werden zentral gekapselt.

## Warum dieser STEP sicher ist

- Default bleibt `sqlite`.
- Ohne gesetztes `DB_ADAPTER` aendert sich am produktiven Betrieb nichts.
- MySQL/MariaDB sind nur als Dialekte/Status/SQL-Helper vorbereitet.
- Bestehende Module koennen weiter unveraendert laufen.
- Neue Module koennen kuenftig zentralere Helper nutzen.

## Syntaxcheck

Geprueft:

```powershell
node --check backend/core/database.js
```

## Minimaler Live-Test nach Entpacken

```powershell
cd D:\Git\stream-control-center
node --check backend\core\database.js
```

Wenn Backend laeuft:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status" | ConvertTo-Json -Depth 30
```

Hinweis: Der konkrete Status-Endpunkt haengt vom vorhandenen Modul `backend/modules/database_core.js` ab. Falls dieser Endpoint anders heisst, zuerst `database_core.js` pruefen.

## Naechster sinnvoller STEP

Kleine Module schrittweise auf `backend/core/database.js` und die neuen Helper ausrichten:

1. `kofi.js`
2. `tipeee.js`
3. `twitch.js`

Grosse Module wie `alert_system.js`, `tagebuch.js`, `todo.js`, `challenge.js` erst spaeter.
