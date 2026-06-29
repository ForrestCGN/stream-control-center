# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.43 - Remote-Modboard Media Index Schema Status Readonly Confirmed Docs`.

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
- Online-DB ueber remote-modboard config/db/db-health und MariaDB/mysql2

Deploy:
- Quelle ist frischer Clone unter /opt/stream-control-center/_deploy_tmp/<STEP>
- Live-Pfad nicht fuer git pull benutzen
```

## 0.2.40 Ergebnis

```text
Server-Migration fuer remote_media_index wurde nach explizitem go migration ausgefuehrt.
Backup: /opt/stream-control-center/_runtime_tmp/remote_modboard_before_remote_media_index_20260629_113811.sql
Backup-Groesse: 44K
Readback: Tabelle existiert, Spalten vorhanden, Indizes vorhanden, row_count = 0
Keine Runtime-Code-Aenderung.
Kein Service-Restart.
Kein Webserver-Deploy.
Keine Media-Daten-Writes.
Kein Upload/Edit/Delete.
```

Step-Doku:

```text
docs/current/RDAP_0.2.40_REMOTE_MODBOARD_MARIADB_MEDIA_SCHEMA_MIGRATION_CONFIRMED_DOCS.md
```

## 0.2.41 Ergebnis

```text
Doku-/State-only Plan fuer die read-only Media-Index-Schema-Diagnose.
Keine Runtime-Code-Aenderung.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Kein Webserver-Deploy.
```

Step-Doku:

```text
docs/current/RDAP_0.2.41_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_READONLY_STATUS_PLAN.md
```

## 0.2.42 Ergebnis

```text
Runtime-Read-only-Diagnose fuer remote_media_index vorbereitet.
Route: GET /api/remote/media/status?db=1
Nutzt: remote-modboard/backend/src/services/db.service.js / withReadOnlyConnection()
Liest: INFORMATION_SCHEMA.TABLES, INFORMATION_SCHEMA.COLUMNS, INFORMATION_SCHEMA.STATISTICS, SELECT COUNT(*)
compatibleForRead wird aus Schema/Indizes abgeleitet.
compatibleForWrite=false.
writeEnabled=false.
dataWritesEnabled=false.
migrationEnabled=false.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
```

Step-Doku:

```text
docs/current/RDAP_0.2.42_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY.md
```

## 0.2.43 Ergebnis

```text
0.2.42 wurde auf dem Webserver deployed und read-only geprueft.

Deploy/Readback bestaetigt:
- GET /api/remote/media/status?db=1
- persistentIndex.ok = true
- inspected = true
- detected = true
- tableName = remote_media_index
- itemCount = 0
- compatibleForRead = true
- compatibleForWrite = false
- writeEnabled = false
- dataWritesEnabled = false
- migrationEnabled = false

Routes-Readback bestaetigt:
- .mediaReadonly.persistentIndexSchemaStatusReadonly.prepared = true
- usesInformationSchemaColumns = true
- usesInformationSchemaStatistics = true
- readsRowCount = true
- compatibleForWrite = false
- writeEnabled = false
- dataWritesEnabled = false
- migrationEnabled = false

Nicht passiert:
- keine Runtime-Code-Aenderung in 0.2.43
- keine SQL-Ausfuehrung
- keine DB-Migration
- keine Media-Daten-Writes
- keine Agent-Writes
- kein Upload/Edit/Delete
- kein Webserver-Deploy fuer 0.2.43, weil Doku-only
```

Step-Doku:

```text
docs/current/RDAP_0.2.43_REMOTE_MODBOARD_MEDIA_INDEX_SCHEMA_STATUS_READONLY_CONFIRMED_DOCS.md
```

## Naechster sinnvoller Step

```text
RDAP_0.2.44_REMOTE_MODBOARD_MEDIA_INDEX_READONLY_USAGE_PLAN
```

Nur planen: ob/wie der vorhandene `remote_media_index` spaeter als echte read-only Quelle/Fallback genutzt werden darf. Keine Writes, keine Agent-Writes, kein Upload/Edit/Delete.
