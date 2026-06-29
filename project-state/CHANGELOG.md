# Changelog

## 0.2.41 - Remote-Modboard Media Index Schema Readonly Status Plan

- Fuegt einen Doku-/State-only Plan fuer die spaetere read-only Diagnose von `remote_media_index` hinzu.
- Dokumentiert geplante read-only Quellen:
  - `INFORMATION_SCHEMA.TABLES`
  - `INFORMATION_SCHEMA.COLUMNS`
  - `INFORMATION_SCHEMA.STATISTICS`
  - `SELECT COUNT(*) FROM remote_media_index`
- Dokumentiert geplante Statusfelder:
  - `compatibleForRead`
  - `compatibleForWrite=false`
  - `writeEnabled=false`
  - `migrationEnabled=false`
  - `mediaDataWritesEnabled=false`
  - `agentWritesEnabled=false`
- Bestaetigt: keine Runtime-Code-Aenderung.
- Bestaetigt: keine SQL-Ausfuehrung.
- Bestaetigt: keine DB-Migration.
- Bestaetigt: keine Media-Daten-Writes.
- Bestaetigt: keine Agent-Writes.
- Bestaetigt: kein Upload/Edit/Delete.
- Bestaetigt: kein Webserver-Deploy.
- Bereinigt den Projektstatus: 0.2.40 ist in GitHub/dev dokumentiert, naechster aktiver lokaler Step ist 0.2.41.

## 0.2.40 - Remote-Modboard MariaDB Media Schema Migration Confirmed Docs

- Dokumentiert die erfolgreich ausgefuehrte MariaDB-Schema-Migration fuer `remote_media_index`.
- Bestaetigt Backup vor Migration:
  - `/opt/stream-control-center/_runtime_tmp/remote_modboard_before_remote_media_index_20260629_113811.sql`
  - Groesse: `44K`
- Bestaetigt ausgefuehrte SQL-Datei aus frischem GitHub/dev Clone:
  - `tools/rdap_0.2.39_remote_media_index_schema.sql`
- Bestaetigt Readback:
  - Tabelle `remote_media_index` existiert.
  - Spalten sind vorhanden.
  - Indizes sind vorhanden.
  - `row_count = 0`.
- Bestaetigt: kein Service-Restart.
- Bestaetigt: kein Webserver-Deploy.
- Bestaetigt: keine Runtime-Code-Aenderung.
- Bestaetigt: keine Media-Daten-Writes.
- Bestaetigt: kein Upload/Edit/Delete.

## 0.2.39 - Remote-Modboard MariaDB Media Schema Migration File No Execute

- Erstellt SQL-Datei fuer spaetere Remote-Modboard-MariaDB-Media-Schema-Migration:
  - `tools/rdap_0.2.39_remote_media_index_schema.sql`
- SQL enthaelt `CREATE TABLE IF NOT EXISTS remote_media_index`.
- SQL-Datei nennt klar: nicht automatisch ausfuehren.
- Bestaetigt: keine SQL-Ausfuehrung.
- Bestaetigt: keine DB-Migration in 0.2.39.
- Bestaetigt: keine Runtime-Aenderung.
- Bestaetigt: keine Media-Daten-Writes.
- Bestaetigt: kein Webserver-Deploy noetig.

## 0.2.38 - Remote-Modboard MariaDB Media Schema Confirmation Plan No Code

- Fuegt reine Doku fuer den Confirm-/Migrationsplan hinzu.
- Dokumentiert geplanten SQL-Dateipfad fuer spaeter:
  - `tools/rdap_0.2.39_remote_media_index_schema.sql`
- Dokumentiert geplantes `CREATE TABLE IF NOT EXISTS remote_media_index` nur als Plan.
- Dokumentiert konkrete Backup-Pflicht mit `mysqldump`.
- Dokumentiert konkrete Readback-Checks ueber `INFORMATION_SCHEMA` und `row_count`.
- Dokumentiert Rollback-Grenzen fuer eine leere Tabellenanlage.
- Bestaetigt: keine Runtime-Aenderung.
- Bestaetigt: keine SQL-Datei erstellt.
- Bestaetigt: keine DB-Migration.
- Bestaetigt: keine CREATE/ALTER/INSERT/UPDATE/DELETE-Ausfuehrung.
- Bestaetigt: keine Media-Daten-Writes.
- Bestaetigt: kein Webserver-Deploy noetig.

## 0.2.37 - Remote-Modboard MariaDB Media Schema Dry Run No Migration

- Fuegt reine Doku fuer einen MariaDB-Schema-Dry-Run hinzu.
- Dokumentiert geplantes Tabellenmodell `remote_media_index`.
- Dokumentiert erlaubte Online-DB-Schicht:
  - `remote-modboard/backend/src/services/db.service.js`
  - `remote-modboard/backend/src/services/config.service.js`
  - `mysql2/promise`
  - MariaDB
- Dokumentiert read-only Vorpruefungen ueber `INFORMATION_SCHEMA`.
- Dokumentiert Backup-/Rollback-Vorgaben fuer einen spaeteren eigenen Migration-Step.
- Bestaetigt: keine Runtime-Aenderung.
- Bestaetigt: keine DB-Migration.
- Bestaetigt: keine CREATE/ALTER/INSERT/UPDATE/DELETE-Ausfuehrung.
- Bestaetigt: keine Media-Daten-Writes.
- Bestaetigt: kein Webserver-Deploy noetig.

## 0.2.36 - Remote-Modboard MariaDB DB Usage Inventory No Code

- Fuegt reine Doku-/Inventur fuer vorhandene Online-DB-Nutzung hinzu.
- Dokumentiert `remote-modboard/backend/src/services/db.service.js` als relevante Remote-Modboard-DB-Schicht.
- Dokumentiert bestehende MariaDB/mysql2 Read-only-Muster:
  - `auth-db-read.service.js`
  - `auth-session-read.service.js`
  - `audit-read.service.js`
- Bestaetigt: `writeEnabled=false`, `migrationEnabled=false`.
- Bestaetigt: keine Media-Index-Tabelle aktiv.
- Keine Runtime-Aenderung.
- Keine DB-Migration.
- Keine Media-Daten-Writes.
- Kein Webserver-Deploy noetig.

## 0.2.35 - Remote-Modboard MariaDB Media Index Plan No Code

- Plant spaetere Media-Index-Richtung ueber Remote-Modboard-MariaDB/mysql2.
- Keine Runtime-Aenderung.
- Keine Migration.

## 0.2.34B - Media Persistent Index Foundation Blocked Docs Fix

- Korrigiert den falschen 0.2.34-Ansatz.
- Entfernt den Versuch, in der Serverroute `backend/core/database.js` aus dem Repo-root zu laden.
- Markiert Persistent Index als blocked/failsafe.
- Dokumentiert: Online-Remote-Modboard nutzt MariaDB/mysql2-Konfiguration ueber `remote-modboard/backend/src/services/config.service.js` und `db-health.service.js`.
- Keine DB-Migration.
- Keine Media-Daten-Writes.
- Keine Upload/Edit/Delete-Aktivierung.
- Route bleibt read-only ueber Agent-Memory/Local-Scan.

## 0.2.34 - Media Persistent Index Migration Foundation Readonly

- Deploy kam an, aber `persistentIndex.ok=false` mit database_layer_unavailable.
- Ursache: falsche DB-Schicht fuer Online-Remote-Modboard angenommen.
- Wird durch 0.2.34B blockiert/korrigiert.
