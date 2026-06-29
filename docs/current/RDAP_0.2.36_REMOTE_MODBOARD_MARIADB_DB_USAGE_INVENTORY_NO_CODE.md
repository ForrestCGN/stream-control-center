# RDAP 0.2.36 - Remote-Modboard MariaDB DB Usage Inventory No Code

Stand: 2026-06-29

## Ziel

Dieser Step ist eine reine Bestandsaufnahme der vorhandenen Online-DB-Nutzung im Remote-Modboard.

Es wird kein Runtime-Code geaendert.
Es wird keine Datenbankmigration ausgefuehrt.
Es werden keine DB-Daten geschrieben.
Es werden keine Media-Daten geschrieben.

## Gelesene echte Dateien aus GitHub/dev

```text
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/auth-db-read.service.js
remote-modboard/backend/src/services/auth-session-read.service.js
remote-modboard/backend/src/services/audit-read.service.js
docs/current/RDAP_0.2.35_REMOTE_MODBOARD_MARIADB_MEDIA_INDEX_PLAN_NO_CODE.md
project-state/*.md
```

## Klare Laufzeit-Trennung

```text
Lokal / Stream-PC:
- Port 8080
- lokale Remote-Modboard-Adapter-Schicht: backend/modules/local_remote_modboard_adapter.js
- lokale Datei-/Media-Wahrheit
- lokale SQLite/Core-Schicht gehoert nicht automatisch zum Online-Remote-Modboard

Online / Webserver:
- Port 3010
- Live-Pfad: /opt/stream-control-center/remote-modboard
- Online-DB ueber remote-modboard/backend/src/services/*
- MariaDB/mysql2 ist die vorhandene Online-Richtung
```

## Vorhandene Online-DB-Basis

### config.service.js

Die Remote-Modboard-Konfiguration liest die Online-DB aus ENV:

```text
DB_ENGINE
DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
```

Der konfigurierte Treiber ist:

```text
mysql2/promise
```

Wichtiger Sicherheitsstand:

```text
database.writeEnabled = false
database.migrationEnabled = false
```

Nur wenn Auth/Twitch/Session/Secrets/DB vollstaendig konfiguriert sind, wird `authEffective` true. Auch dann bleibt `migrationEnabled=false`.

### db-health.service.js

Vorhanden ist ein Health-Check fuer MariaDB/mysql2:

```text
- prueft Treiber-Verfuegbarkeit
- prueft ENV-Konfiguration
- optionaler Connect-Test mit SELECT 1 AS ok
- setzt writeEnabled=false
- setzt migrationEnabled=false
```

Dieser Service ist Diagnose/Health, kein Migrationsservice.

### db.service.js

Vorhanden ist die echte Remote-Modboard-DB-Hilfsschicht:

```text
buildDatabaseReadiness(config)
createReadOnlyConnection(config)
createWriteConnection(config)
withReadOnlyConnection(config, fn)
withWriteConnection(config, fn)
publicDbError(err)
```

Wichtige Sicherheitsdetails:

```text
- MariaDB-Verbindung ueber mysql2/promise
- multipleStatements=false
- read-only Verbindungen setzen SET SESSION TRANSACTION READ ONLY
- createWriteConnection blockiert, wenn config.database.writeEnabled !== true
- migrationEnabled bleibt false
```

Das ist die richtige Schicht fuer spaetere Remote-Modboard-MariaDB-Arbeit, nicht `backend/core/database.js`.

## Bereits vorhandene Online-DB-Nutzung

### auth-db-read.service.js

Read-only Auth-/Rechte-/Session-/Audit-Modell.

Erwartete Tabellen:

```text
schema_migrations
dashboard_users
dashboard_identities
dashboard_roles
dashboard_user_roles
dashboard_groups
dashboard_user_groups
dashboard_permissions
dashboard_role_permissions
dashboard_module_permissions
dashboard_sessions
dashboard_locks
dashboard_audit_log
```

Nutzung:

```text
- liest Tabellenliste aus INFORMATION_SCHEMA.TABLES
- liest Migrationen aus schema_migrations
- liest User/Rollen/Gruppen/Permissions/Sessions read-only
- liest Counts read-only
- writeEnabled=false
- migrationEnabled=false
- authEnabled=false in dieser Read-Route
- sessionCreationEnabled=false
```

### auth-session-read.service.js

Read-only Session-Validierung.

Nutzung:

```text
- liest Session-Cookie
- prueft Format defensiv
- liest dashboard_sessions per SELECT
- setzt keine Cookies
- erstellt keine Sessions
- refresh/updateLastSeen=false
- databaseWriteEnabled=false
```

### audit-read.service.js

Read-only Audit-Schema/Status.

Nutzung:

```text
- Tabelle: dashboard_audit_log
- liest INFORMATION_SCHEMA.COLUMNS nur bei db=1
- prueft Mapping/Kompatibilitaet
- schreibt keine Audit-Eintraege
- aktualisiert keine Zeilen
- migrationEnabled=false
- auditWriteEnabled=false
- rawPayloadLoggingEnabled=false
```

## Ergebnis der Inventur

```text
Es gibt bereits eine Online-MariaDB-Schicht im Remote-Modboard.
Sie ist aktuell bewusst read-only ausgerichtet.
Es gibt bereits sichere Read-only-Muster fuer:
- DB-Readiness
- Auth-/Rechte-Modell
- Session-Lookup
- Audit-Schema-Inspektion

Es gibt aktuell keine freigegebene allgemeine Migration-Schicht fuer Media.
Es gibt aktuell keine freigegebene Media-Index-Tabelle.
Es gibt aktuell keine Media-DB-Writes.
```

## Konsequenz fuer Media-Index

Spaetere Media-Index-Arbeit darf nur diese Richtung nutzen:

```text
remote-modboard/backend/src/services/db.service.js
remote-modboard/backend/src/services/config.service.js
mysql2/promise
MariaDB
```

Nicht verwenden:

```text
backend/core/database.js
backend/modules/sqlite_core.js
Repo-root-SQLite fuer Online-Remote-Modboard
manuelle Kopien in /opt/stream-control-center/remote-modboard
```

## Empfohlener naechster Step

```text
RDAP_0.2.37_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_DRY_RUN_NO_MIGRATION
```

Ziel:

```text
- keine Migration
- keine Writes
- neuer read-only Schema-Dry-Run/Plan
- Tabellenmodell fuer remote_media_index gegen vorhandene MariaDB-Konventionen abgleichen
- Backup/Rollback-Vorgaben dokumentieren
- Migration-SQL als Plan vorbereiten, nicht ausfuehren
```

## Nicht tun

```text
Keine DB-Migration.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Keine lokale SQLite-Schicht fuer Online verwenden.
Keine Server-Hotfix-Kopien.
Kein Webserver-Deploy fuer diesen Doku-only-Step.
```

## Check fuer diesen Step

```powershell
Select-String -Path .\docs\current\RDAP_0.2.36_REMOTE_MODBOARD_MARIADB_DB_USAGE_INVENTORY_NO_CODE.md -Pattern "db.service.js","withReadOnlyConnection","dashboard_sessions","dashboard_audit_log","Keine DB-Migration"

git status
```

Kein Webserver-Deploy noetig, weil keine Runtime-Datei geaendert wird.
