# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.37 - Remote-Modboard MariaDB Media Schema Dry Run No Migration`.

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

## Naechster sinnvoller Step

```text
RDAP_0.2.38_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_CONFIRMATION_PLAN_NO_CODE
```

Nur Confirm-/Migrationsplanung mit konkretem Backup/Readback/Rollback. Keine Migration und keine Writes, bis Forrest einen separaten MariaDB-Migration-Step ausdruecklich freigibt.
