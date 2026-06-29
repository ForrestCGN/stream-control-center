# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.40 - Remote-Modboard MariaDB Media Schema Migration Confirmed Docs`.

## Verbindlich

```text
GitHub/dev ist Wahrheit.
Vor Planung/Code echte Dateien aus GitHub/dev lesen.
Erst Plan nennen, dann auf explizites go warten.
Remote-Modboard ist die einzige UI-Wahrheit.
Lokal 8080 und Webserver 3010 strikt trennen.
Keine zweite lokale UI.
Keine Online-Sonder-UI.
```

## Harte Laufzeit-Trennung

```text
Lokal / Stream-PC:
- Port 8080
- lokale Schicht: backend/modules/local_remote_modboard_adapter.js
- lokale Datei-/Media-Wahrheit

Webserver / Remote-Modboard:
- Port 3010
- Live-Pfad: /opt/stream-control-center/remote-modboard
- kein Git-Repo im Live-Pfad
- keine lokale Repo-root-SQLite-Schicht
- Online-DB ueber remote-modboard config/db/db-health und MariaDB/mysql2

Deploy:
- Quelle ist frischer Clone unter /opt/stream-control-center/_deploy_tmp/<STEP>
- Live-Pfad nicht fuer git pull benutzen
```

## 0.2.34B Ergebnis

```text
0.2.34 war als DB-Foundation mit falscher DB-Schicht angesetzt.
0.2.34B blockiert diesen Ansatz sauber.
media-readonly.routes.js versucht nicht mehr, backend/core/database.js zu laden.
Persistent Index bleibt blocked/failsafe.
Keine DB-Migration.
Keine Media-Daten-Writes.
Route bleibt read-only ueber Agent-Memory/Local-Scan.
```

## 0.2.35 Ergebnis

```text
No-Code-Architekturplan fuer spaetere Remote-Modboard-MariaDB-Media-Index-Arbeit.
Keine Runtime-Aenderung.
Keine Migration.
Kein Webserver-Deploy.
```

## 0.2.36 Ergebnis

```text
No-Code-Inventur der vorhandenen Online-DB-Nutzung.
Gelesene Remote-Modboard-DB-Schicht:
- remote-modboard/backend/src/services/config.service.js
- remote-modboard/backend/src/services/db-health.service.js
- remote-modboard/backend/src/services/db.service.js
- remote-modboard/backend/src/services/auth-db-read.service.js
- remote-modboard/backend/src/services/auth-session-read.service.js
- remote-modboard/backend/src/services/audit-read.service.js

Ergebnis:
- Online nutzt MariaDB/mysql2.
- db.service.js ist die relevante Remote-Modboard-DB-Schicht.
- Read-only Muster existieren.
- writeEnabled/migrationEnabled bleiben false.
- Kein Media-Index-Schema aktiv.
- Keine Media-DB-Writes aktiv.
```

Step-Doku:

```text
docs/current/RDAP_0.2.36_REMOTE_MODBOARD_MARIADB_DB_USAGE_INVENTORY_NO_CODE.md
```

## 0.2.37 Ergebnis

```text
No-Code/No-Migration Schema-Dry-Run fuer spaetere Remote-Modboard-MariaDB-Media-Index-Arbeit.

Dokumentiert:
- geplantes Tabellenmodell remote_media_index
- zulaessige DB-Schicht db.service.js/config.service.js
- read-only Vorpruefungen ueber INFORMATION_SCHEMA
- Backup-Vorgabe fuer spaetere Migration
- Rollback-Vorgabe fuer spaetere Migration

Nicht passiert:
- keine Runtime-Aenderung
- keine DB-Migration
- keine CREATE/ALTER/INSERT/UPDATE/DELETE-Ausfuehrung
- keine Media-Daten-Writes
- kein Webserver-Deploy
```

Step-Doku:

```text
docs/current/RDAP_0.2.37_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_DRY_RUN_NO_MIGRATION.md
```

## 0.2.38 Ergebnis

```text
No-Code Confirm-/Migrationsplan fuer spaetere Remote-Modboard-MariaDB-Media-Schema-Arbeit.

Dokumentiert:
- geplanter SQL-Dateipfad fuer spaeter: tools/rdap_0.2.39_remote_media_index_schema.sql
- geplantes CREATE TABLE IF NOT EXISTS remote_media_index als Plan
- konkrete Backup-Pflicht mit mysqldump
- konkrete Readback-Checks ueber INFORMATION_SCHEMA und row_count
- konkrete Rollback-Grenzen fuer leere Tabelle

Nicht passiert:
- keine Runtime-Aenderung
- keine SQL-Datei erstellt
- keine DB-Migration
- keine CREATE/ALTER/INSERT/UPDATE/DELETE-Ausfuehrung
- keine Media-Daten-Writes
- kein Webserver-Deploy
```

Step-Doku:

```text
docs/current/RDAP_0.2.38_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_CONFIRMATION_PLAN_NO_CODE.md
```

## 0.2.39 Ergebnis

```text
SQL-Datei fuer spaetere Remote-Modboard-MariaDB-Media-Schema-Migration wurde vorbereitet.

Erstellt:
- tools/rdap_0.2.39_remote_media_index_schema.sql

Dokumentiert:
- CREATE TABLE IF NOT EXISTS remote_media_index
- SQL-Datei darf nicht automatisch ausgefuehrt werden
- Ausfuehrung erst in eigenem Server-Migration-Confirm-Step

Nicht passiert:
- keine Runtime-Aenderung
- keine SQL-Ausfuehrung
- keine DB-Migration
- keine CREATE/ALTER/INSERT/UPDATE/DELETE-Ausfuehrung auf Server/DB
- keine Media-Daten-Writes
- kein Webserver-Deploy
```

Step-Doku:

```text
docs/current/RDAP_0.2.39_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_FILE_NO_EXECUTE.md
```

## 0.2.40 Ergebnis

```text
Server-Migration fuer remote_media_index wurde nach explizitem go migration ausgefuehrt.

Ausgefuehrt:
- frischer GitHub/dev Clone unter /opt/stream-control-center/_deploy_tmp/RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED_20260629_113811
- SQL-Datei aus dem Clone:
  tools/rdap_0.2.39_remote_media_index_schema.sql
- MariaDB CREATE TABLE IF NOT EXISTS remote_media_index

Backup:
- /opt/stream-control-center/_runtime_tmp/remote_modboard_before_remote_media_index_20260629_113811.sql
- Backup-Groesse: 44K

Readback:
- Tabelle remote_media_index existiert
- Spalten vorhanden
- Indizes vorhanden
- row_count = 0

Nicht passiert:
- keine Runtime-Code-Aenderung
- kein Service-Restart
- kein Webserver-Deploy
- keine Media-Daten-Writes
- kein Upload/Edit/Delete
```

Step-Doku:

```text
docs/current/RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED_DOCS.md
```

## Naechster sinnvoller Step

```text
RDAP_0.2.41_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_READONLY_STATUS_PLAN
```

Nur planen: read-only Status-/Diagnose-Sicht auf das vorhandene remote_media_index Schema vorbereiten. Keine Media-Writes, keine Agent-Writes, kein Upload/Edit/Delete.
