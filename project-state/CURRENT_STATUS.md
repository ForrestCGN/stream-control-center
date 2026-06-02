# CURRENT_STATUS

## Stand: CAN-30.1 abgeschlossen

CAN-30.1 dokumentiert die SQLite ExperimentalWarning als bekannte Runtime-Warnung ohne akuten Handlungsbedarf.

## Aktueller Arbeitsbereich

```text
CAN-30: SQLite ExperimentalWarning bewerten
```

## Analyseergebnis CAN-30.0

Die Warnung kommt aus:

```text
backend/modules/sqlite_core.js
```

Ursache:

```text
sqlite_core.js nutzt Node-Core-Modul node:sqlite und DatabaseSync.
```

Relevante Code-Stellen:

```text
const { DatabaseSync } = require("node:sqlite");
dbPath = path.join(dataDir, "app.sqlite");
db = new DatabaseSync(dbPath);
```

## Live-Zustand

Die produktive DB startet sauber:

```text
[sqlite_core] v0.1.0 ready: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Die Warning ist eine Node-Runtime-Warnung:

```text
ExperimentalWarning: SQLite is an experimental feature and might change at any time
```

## Entscheidung CAN-30.1

```text
Keine Codeänderung.
Keine DB-Änderung.
Kein Treiberwechsel.
Keine Warning-Unterdrückung per Startscript.
Keine Migration.
```

Begründung:

```text
sqlite_core.js ist zentraler DB-Core.
Die produktive DB liegt unter D:\Streaming\stramAssets\data\sqlite\app.sqlite.
Ein DB-Core-Umbau braucht eigenen Plan mit Backup, Rollback und Tests.
```

## Späterer Kandidat

```text
Optional später: DB-Core sauber planen, falls node:sqlite ersetzt werden soll.
```

Das wäre ein eigener größerer Schritt, nicht Teil von CAN-30.1.

## Nächster Schritt

```text
CAN-31.0 neuen Arbeitsblock bewusst auswählen.
```
