# Current Status

Stand: 2026-06-29

Aktuell: `0.2.38 - Remote-Modboard MariaDB Media Schema Confirmation Plan No Code`.

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
- Media bleibt online read-only ueber Agent-Memory.
- Keine Media-Persistenz aktiv.
- Keine DB-Migration aktiv.
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

## 0.2.37 Dokumentiert

```text
- geplantes Tabellenmodell remote_media_index
- nur sanitisiertes Media-Inventar
- keine absoluten Pfade / keine Datei-Inhalte / keine Secrets
- read-only Vorpruefungen ueber INFORMATION_SCHEMA
- Backup-Vorgabe fuer spaetere Migration
- Rollback-Vorgabe fuer spaetere Migration
- Status-/Diagnose-Idee fuer spaeter
```

## 0.2.38 Dokumentiert

```text
- geplanter SQL-Dateipfad: tools/rdap_0.2.39_remote_media_index_schema.sql
- geplantes CREATE TABLE IF NOT EXISTS remote_media_index nur als Plan
- konkrete Backup-Pflicht mit mysqldump
- konkrete Readback-Checks ueber INFORMATION_SCHEMA und row_count
- konkrete Rollback-Grenzen fuer leere Tabelle
- naechster Step bleibt SQL-Datei ohne Ausfuehrung
```

## Sicherheitsstatus

```text
lokal 8080 != webserver 3010
Live-Pfad ist kein Git-Repo
keine manuellen DB-/Datei-Kopien auf dem Server
keine SQLite-/Repo-root-DB fuer Online-Remote-Modboard annehmen
db.service.js ist die relevante Online-DB-Schicht
writeEnabled=false und migrationEnabled=false bleiben fuer Media unveraendert
remote_media_index ist nur geplant/dokumentiert, nicht migriert
keine produktiven Media-DB-Writes
```
