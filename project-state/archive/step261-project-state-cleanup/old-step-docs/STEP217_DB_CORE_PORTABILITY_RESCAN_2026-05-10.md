# STEP217 - DB-Core-Portability Rescan & Cleanup-Doku - 2026-05-10

## Ziel

Nach den Portierungen STEP209 bis STEP216 wurde ein erneuter DB-Core-Portability-Scan ausgewertet und dokumentiert.

Dieser STEP ist ein reiner Doku-/Cleanup-STEP.

## Ergebnis des Restscans

Der Restscan `DB_CORE_PORTABILITY_RESCAN_2026-05-10.txt` zeigt:

- Produktive Module mit direktem `require("./sqlite_core")` sind praktisch entfernt.
- Die erwarteten zentralen Treffer bleiben:
  - `backend/core/database.js`
  - `backend/modules/sqlite_core.js`
- `backend/core/database.js` ist aktuell bewusst der zentrale Adapter ueber `backend/modules/sqlite_core.js`.
- `backend/modules/sqlite_core.js` bleibt aktiv, weil SQLite weiterhin der produktive Standard ist.

## Noch vorhandener Sonderfall

Gefunden wurde ausserdem:

```text
backend/check_alert_db.js
```

Einordnung:

- Das ist ein altes technisches Pruefscript.
- Es ist kein normales produktives Backend-Modul.
- Es nutzt direkt `node:sqlite`, `DatabaseSync`, `PRAGMA integrity_check` und einen hart codierten Pfad zur produktiven SQLite-Datei.
- Es wird in diesem STEP nicht geloescht und nicht umgebaut.

Empfehlung fuer spaeter:

- Entweder als historisches Diagnosescript dokumentiert lassen,
- oder in einem separaten Cleanup-STEP entfernen/archivieren,
- oder auf `backend/core/database.js` umstellen.

## Weiterhin vorhandene SQLite-nahe SQL-Konstrukte

Der Scan findet weiterhin viele SQLite-nahe SQL-Konstrukte, z. B.:

```text
INTEGER PRIMARY KEY AUTOINCREMENT
INSERT OR IGNORE
ON CONFLICT(...)
PRAGMA table_info(...)
```

Das ist im aktuellen Stand bewusst akzeptiert, weil:

- SQLite weiterhin produktiv aktiv bleibt.
- MySQL/MariaDB noch nicht aktiv genutzt werden.
- Die erste Portabilitaetsrunde nur die direkte Modul-Kopplung an `sqlite_core.js` entfernen sollte.

Diese SQL-Konstrukte sind Thema einer zweiten DB-Portabilitaetsrunde.

## Bewusst nicht geaendert

- keine Backend-Module
- keine Datenbank
- keine Tabellenstruktur
- keine Migration
- kein `package.json`
- kein MySQL-/MariaDB-Treiber
- keine MySQL-/MariaDB-Verbindung
- keine Aenderung an `backend/core/database.js`
- keine Aenderung an `backend/modules/sqlite_core.js`

## Geaendert

- `project-state/STEP217_DB_CORE_PORTABILITY_RESCAN_2026-05-10.md` neu angelegt.
- Projektstatus-Dokus aktualisiert.
- `project-state/STEP216_CHALLENGE_DB_CORE_PORTABILITY_2026-05-10.md` sprachlich bereinigt, damit der Vorher-Zustand nicht als aktueller Pfad missverstanden wird.

## Aktueller Stand nach STEP217

Portiert auf `backend/core/database.js`:

```text
kofi.js
tipeee.js
twitch.js
sound_system.js
dashboard_auth.js
alert_system.js
tagebuch.js
todo.js
challenge.js
```

SQLite bleibt aktiv:

```text
Module -> backend/core/database.js -> backend/modules/sqlite_core.js -> D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

MySQL/MariaDB bleiben vorbereitet, aber nicht aktiv.

## Naechste sinnvolle Schritte

1. Optional: `backend/check_alert_db.js` separat einordnen oder bereinigen.
2. Danach zweite DB-Portabilitaetsrunde planen:
   - `INTEGER PRIMARY KEY AUTOINCREMENT` zentral kapseln.
   - `ON CONFLICT(...)`/Upsert zentral kapseln.
   - `INSERT OR IGNORE` zentral kapseln.
   - `PRAGMA table_info(...)` durch `database.columnExists(...)`/Helper ersetzen.
3. Erst danach echten MySQL-/MariaDB-Adapter und Treiber planen.
