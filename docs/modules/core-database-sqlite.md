# Modul-Doku: Datenbank-Core / SQLite

Stand: 2026-05-26 / STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE  
Quellen: `backend/modules/sqlite_core.js`, `backend/modules/database_core.js`, `backend/core/database.js`

## Zweck

Die Datenbank-Schicht stellt die zentrale SQLite-Anbindung und Diagnose bereit. Sie ist Grundlage für Module mit persistenten Daten wie Stream-Status, Texte, Settings, Alerts, Shoutouts, Tagebuch/Todo usw.

Verbindliche Projektregel: Die produktive SQLite-Datenbank darf nicht neu gebaut, überschrieben oder ersetzt werden.

## Hauptdateien

```text
backend/core/database.js
backend/modules/sqlite_core.js
backend/modules/database_core.js
```

## Routen

`database_core.js` registriert:

| Methode | Route | Zweck |
|---|---|---|
| GET | `/api/database/status` | Datenbankstatus |
| GET | `/api/system/database/status` | Legacy-/System-Alias für Datenbankstatus |

## `sqlite_core.js`

### Aufgabe

`sqlite_core.js` initialisiert `node:sqlite` direkt und öffnet:

```text
data/sqlite/app.sqlite
```

über:

```text
config.resolveFromRoot("data", "sqlite")
```

### PRAGMA-Einstellungen

```text
PRAGMA journal_mode = WAL
PRAGMA synchronous = FULL
PRAGMA foreign_keys = ON
PRAGMA busy_timeout = 5000
```

### Tabelle `schema_versions`

```text
module_name TEXT PRIMARY KEY
version INTEGER NOT NULL
updated_at TEXT NOT NULL
```

Zweck: additive Modulmigrationen versionieren.

### Exporte

```text
init
getDb
getDbPath
isInitialized
buildStatus
exec
run
get
all
transaction
ensureSchema
getSchemaVersion
setSchemaVersion
nowIso
```

### Wichtige Funktionen

```text
initDatabase
buildStatus
transaction
getSchemaVersion
setSchemaVersion
ensureSchema
close
```

## `database_core.js`

### Aufgabe

Initialisiert `backend/core/database.js` über `database.init(ctx)` und stellt Diagnose-Routen bereit.

### Rückgabe aus `init`

```text
{ name: "database_core", step: "013" }
```

Das `step`-Feld ist Altbestand und sollte nicht ungeprüft umgebaut werden.

## Datenbank-Regeln

```text
SQLite niemals neu bauen.
SQLite niemals überschreiben.
SQLite niemals ersetzen.
Keine Datenbank-Dateien committen.
Keine Backups committen.
Schemaänderungen nur additiv.
CREATE TABLE IF NOT EXISTS bevorzugen.
ALTER TABLE nur vorsichtig und geprüft.
```

## Auffälligkeit aus Upload

Im hochgeladenen Backend-ZIP wurde eine Datei gefunden:

```text
backend/data/app.sqlite
```

Das muss lokal geprüft werden. Nach Projektregel sollte die produktive Datenbank unter folgendem Pfad liegen:

```text
D:\Streaming\stramAssets\data\sqlitepp.sqlite
```

und im Repo sollten keine DB-Dateien liegen.

## Abhängigkeiten

```text
node:sqlite
helper_core
helper_config
helper_routes
backend/core/database.js
```

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/database/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/system/database/status"
```

Nur gezielt, wenn nötig:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/database/status"
$s | Select-Object ok,initialized,databasePath,lastError
```

## Offene Punkte

- Prüfen, ob `sqlite_core.js` und `backend/core/database.js` parallel oder historisch nebeneinander genutzt werden.
- DB-Nutzung pro Modul vollständig in Modul-Dokus erfassen.
- Keine DB-Dateien im Repo zulassen.
