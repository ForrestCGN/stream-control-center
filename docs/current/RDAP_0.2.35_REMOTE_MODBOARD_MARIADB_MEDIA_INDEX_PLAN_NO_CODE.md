# RDAP 0.2.35 - Remote-Modboard MariaDB Media Index Plan No Code

Stand: 2026-06-29

## Ziel

Dieser Step ist ein reiner Architektur-/Plan-Step. Er korrigiert den weiteren Kurs nach 0.2.34/0.2.34B und legt fest, wie ein spaeterer Online-Media-Index geplant werden darf.

Es wird kein Runtime-Code geaendert.
Es wird keine Datenbankmigration ausgefuehrt.
Es werden keine Media-Daten geschrieben.

## Ausgangslage

```text
0.2.34:
- versuchte, den Online-Media-Index ueber backend/core/database.js / SQLite-Repo-root-Schicht vorzubereiten.
- das war fuer den Webserver-Live-Kontext falsch.
- Ergebnis online: persistentIndex.ok=false, database_layer_unavailable.

0.2.34B:
- blockiert diesen falschen Ansatz.
- markiert persistentIndex als blocked/failsafe.
- migrationEnabled=false.
- dataWritesEnabled=false.
- fallbackReadsEnabled=false.
```

## Verbindliche Laufzeitgrenzen

```text
Lokal / Stream-PC:
- Port 8080.
- lokale Wahrheit fuer Dateien/Assets.
- lokale Remote-Modboard-Adapter-Schicht: backend/modules/local_remote_modboard_adapter.js.
- darf lokale Media-Dateien read-only scannen.

Online / Webserver:
- Port 3010 intern.
- Live-Pfad: /opt/stream-control-center/remote-modboard.
- nutzt Remote-Modboard-Konfiguration unter remote-modboard/backend/src/services/.
- nutzt vorhandene MariaDB/mysql2-Konfiguration.
- darf keine lokalen absoluten Stream-PC-Pfade speichern.
- darf keine Datei-Inhalte speichern.

Deploy:
- immer aus frischem _deploy_tmp Clone.
- Live-Pfad ist kein Git-Repo.
```

## Echte Online-DB-Schicht

Fuer spaetere Online-Persistenz ist nur diese Richtung zulaessig:

```text
remote-modboard/backend/src/services/config.service.js
remote-modboard/backend/src/services/db-health.service.js
mysql2/promise
MariaDB
```

Nicht zulaessig fuer Online-Remote-Modboard:

```text
backend/core/database.js
backend/modules/sqlite_core.js
Repo-root-SQLite im Webserver-Live-Pfad
manuelle Kopie lokaler DB-Schichten in /opt/stream-control-center/remote-modboard
```

## Datenfluss fuer Media

```text
Stream-PC / lokal 8080
liest echte Assets read-only

Remote-Agent
sendet sanitisiertes Media-Inventar per WSS

Webserver / Remote-Modboard 3010
nimmt sanitisiertes Inventar entgegen
haelt es aktuell memory-only
spaeter optional: schreibt sanitisierten Index in MariaDB

Online-UI
zeigt Media read-only
```

## Was ein spaeterer Media-Index speichern darf

Nur sanitisiertes Inventar:

```text
root_key
kind
relative_path
name
extension
size_bytes
modified_at
first_seen_at
last_seen_at
deleted
source
sync_version
updated_at
```

Nicht speichern:

```text
absolute Windows-/Linux-Pfade
Datei-Inhalte
Base64/Binary Content
Secrets
Shell-/Command-Daten
OBS-/Agent-Actions
lokale User-/Systempfade
```

## Tabellenmodell-Vorschlag fuer spaeter

Noch nicht ausfuehren. Nur Planung.

```sql
CREATE TABLE remote_media_index (
  id VARCHAR(260) PRIMARY KEY,
  root_key VARCHAR(40) NOT NULL,
  kind VARCHAR(20) NOT NULL,
  relative_path VARCHAR(500) NOT NULL,
  name VARCHAR(180) NOT NULL,
  extension VARCHAR(20) NOT NULL,
  size_bytes BIGINT NOT NULL DEFAULT 0,
  modified_at DATETIME NULL,
  first_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted TINYINT(1) NOT NULL DEFAULT 0,
  source VARCHAR(80) NOT NULL DEFAULT 'agent_wss_media_inventory_sync',
  sync_version INT NOT NULL DEFAULT 1,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY idx_remote_media_index_root_path (root_key, relative_path),
  KEY idx_remote_media_index_kind (kind),
  KEY idx_remote_media_index_deleted_last_seen (deleted, last_seen_at)
);
```

## Sicherheitsregeln fuer spaetere Umsetzung

```text
- Migration nur in eigenem Step.
- Vor Migration: DB-Health pruefen.
- Vor Migration: Backup/Rollback-Befehl dokumentieren.
- Migration muss idempotent sein.
- Media-Daten-Writes erst in separatem Step nach Schema.
- Fallback-Reads erst in separatem Step nach erfolgreichem Daten-Sync.
- Upload/Edit/Delete bleiben deaktiviert.
- Agent darf keine Aktionen ausfuehren.
```

## Reihenfolge ab hier

### 0.2.36 - Schema Dry Run Plan

```text
- echte MariaDB-Verbindung health-checken
- vorhandene Tabellen/Schema-Konventionen lesen
- Migration-SQL finalisieren
- Backup/Rollback festlegen
- keine Migration ausfuehren
```

### 0.2.37 - Schema Migration Confirmed

```text
- nur Tabelle/Index anlegen
- keine Media-Daten schreiben
- Statusroute zeigt schemaReady=true
```

### 0.2.38 - Agent Media Index Write Disabled Preview

```text
- Sync-Write-Code vorbereiten, aber per Gate deaktiviert
- keine produktiven Writes
```

### 0.2.39 - Controlled Media Index Write

```text
- nur nach Confirm-Gate
- nur sanitisiertes Agent-Inventar
- keine Upload/Edit/Delete-Funktion
```

## Check fuer diesen Step

Da 0.2.35 Doku-only ist:

```powershell
Select-String -Path .\docs\current\RDAP_0.2.35_REMOTE_MODBOARD_MARIADB_MEDIA_INDEX_PLAN_NO_CODE.md -Pattern "remote_modboard_mariadb","mysql2/promise","Keine DB-Migration","backend/core/database.js"

git status
```

Kein Webserver-Deploy noetig, weil keine Runtime-Datei geaendert wird.
