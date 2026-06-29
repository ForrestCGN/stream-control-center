# Current Status

Stand: 2026-06-29

Aktuell: `0.2.40 - Remote-Modboard MariaDB Media Schema Migration Confirmed Docs`.

## Technischer Stand

```text
- 0.2.33 ist lokal/online bestaetigt: keine rohen Media-i18n-Keys mehr.
- 0.2.34 wurde deployt, Route lief, aber persistentIndex.ok=false mit database_layer_unavailable.
- Ursache: 0.2.34 nutzte falsch die lokale Repo-root-SQLite-Schicht backend/core/database.js.
- Online-Remote-Modboard nutzt bereits DB-Konfiguration ueber MariaDB/mysql2.
- 0.2.34B blockiert den falschen DB-Ansatz.
- 0.2.35 plant die spaetere MariaDB-Media-Index-Richtung ohne Code.
- 0.2.36 inventarisiert die vorhandene Remote-Modboard-DB-Nutzung ohne Code.
- 0.2.37 dokumentiert das remote_media_index Schema als Dry-Run ohne Migration.
- 0.2.38 dokumentiert den Confirm-/Migrationsplan ohne Code und ohne SQL-Ausfuehrung.
- 0.2.39 erstellt die SQL-Datei tools/rdap_0.2.39_remote_media_index_schema.sql, fuehrt sie aber nicht aus.
- 0.2.40 hat die MariaDB-Tabelle remote_media_index auf dem Webserver angelegt.
- Media bleibt online read-only ueber Agent-Memory.
- Media-Schema ist vorhanden.
- Keine Media-Persistenz-Daten aktiv.
- Keine Upload/Edit/Delete-Funktion aktiv.
```

## Vorhandene Online-DB-Schicht

```text
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/services/db.service.js
```

## Vorhandene Read-only DB-Nutzung

```text
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/auth-session-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
```

## 0.2.39 Erstellt

```text
- tools/rdap_0.2.39_remote_media_index_schema.sql
- CREATE TABLE IF NOT EXISTS remote_media_index
- SQL-Datei war nur vorbereitet, nicht in 0.2.39 ausgefuehrt
- keine Runtime-Dateien geaendert
- kein Webserver-Deploy noetig
```

## 0.2.40 Server-Migration bestaetigt

```text
Ausgefuehrt:
- SQL aus frischem GitHub/dev Clone unter _deploy_tmp
- SQL-Datei: tools/rdap_0.2.39_remote_media_index_schema.sql
- CREATE TABLE IF NOT EXISTS remote_media_index

Backup:
- /opt/stream-control-center/_runtime_tmp/remote_modboard_before_remote_media_index_20260629_113811.sql
- Groesse: 44K

Readback:
- remote_media_index existiert
- Spalten vorhanden
- Indizes vorhanden
- row_count = 0

Nicht passiert:
- kein Service-Restart
- kein Webserver-Deploy
- keine Media-Daten-Writes
- kein Upload/Edit/Delete
```

## Sicherheitsstatus

```text
lokal 8080 != webserver 3010
Live-Pfad ist kein Git-Repo
keine manuellen DB-/Datei-Kopien in /opt/stream-control-center/remote-modboard
keine SQLite-/Repo-root-DB fuer Online-Remote-Modboard annehmen
db.service.js ist die relevante Online-DB-Schicht
remote_media_index Schema existiert auf MariaDB
remote_media_index ist leer
keine produktiven Media-DB-Writes
```
