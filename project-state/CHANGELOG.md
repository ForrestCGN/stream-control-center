# Changelog

## 0.2.44 - Remote-Modboard Media Index Readonly Usage Plan

- Dokumentiert den Plan fuer spaetere read-only Nutzung von `remote_media_index` als Quelle oder Fallback.
- Haelt fest: Agent-Memory bleibt vorerst primaere Online-Wahrheit.
- Benennt erlaubte sichere DB-Lesefelder:
  - `id`
  - `root_key`
  - `kind`
  - `relative_path`
  - `name`
  - `extension`
  - `size_bytes`
  - `modified_at`
  - `first_seen_at`
  - `last_seen_at`
  - `deleted`
  - `source`
  - `sync_version`
  - `updated_at`
- Dokumentiert spaeter zu klaerende read-only Bewertungsregeln fuer:
  - `deleted`
  - `last_seen_at`
  - stale Daten
  - `itemCount`
- Bestaetigt: keine Runtime-Code-Aenderung.
- Bestaetigt: keine SQL-Ausfuehrung.
- Bestaetigt: keine DB-Migration.
- Bestaetigt: keine Media-Daten-Writes.
- Bestaetigt: keine Agent-Writes.
- Bestaetigt: kein Upload/Edit/Delete.
- Bestaetigt: kein Webserver-Deploy noetig.

## 0.2.43 - Remote-Modboard Media Index Schema Status Readonly Confirmed Docs

- Dokumentiert Webserver-Deploy und Readback fuer 0.2.42.
- Bestaetigt `GET /api/remote/media/status?db=1`:
  - `persistentIndex.ok = true`
  - `inspected = true`
  - `detected = true`
  - `tableName = remote_media_index`
  - `itemCount = 0`
  - `compatibleForRead = true`
  - `compatibleForWrite = false`
  - `writeEnabled = false`
  - `dataWritesEnabled = false`
  - `migrationEnabled = false`
- Bestaetigt Routes-Readback fuer `.mediaReadonly.persistentIndexSchemaStatusReadonly`.
- Keine Runtime-Code-Aenderung in 0.2.43.
- Kein Webserver-Deploy fuer 0.2.43.

## 0.2.42 - Remote-Modboard Media Index Schema Status Readonly

- Erweitert `remote-modboard/backend/src/routes/media-readonly.routes.js` um optionale read-only Diagnose fuer `remote_media_index`.
- Neue Diagnose ueber:
  - `GET /api/remote/media/status?db=1`
- Nutzt ausschliesslich die vorhandene Online-DB-Schicht:
  - `remote-modboard/backend/src/services/db.service.js`
  - `withReadOnlyConnection()`
  - MariaDB / `mysql2/promise`
- Liest nur:
  - `INFORMATION_SCHEMA.TABLES`
  - `INFORMATION_SCHEMA.COLUMNS`
  - `INFORMATION_SCHEMA.STATISTICS`
  - `SELECT COUNT(*) AS row_count FROM remote_media_index`
- Haelt fest:
  - `compatibleForWrite=false`
  - `writeEnabled=false`
  - `dataWritesEnabled=false`
  - `migrationEnabled=false`
- Bestaetigt: keine SQL-Ausfuehrung.
- Bestaetigt: keine DB-Migration.
- Bestaetigt: keine Media-Daten-Writes.
- Bestaetigt: keine Agent-Writes.
- Bestaetigt: kein Upload/Edit/Delete.

## 0.2.41 - Remote-Modboard Media Index Schema Readonly Status Plan

- Dokumentiert den Plan fuer die read-only Media-Index-Schema-Diagnose.
- Keine Runtime-Aenderung.
- Keine SQL-Ausfuehrung.
- Keine DB-Migration.
- Keine Media-Daten-Writes.

## 0.2.40 - Remote-Modboard MariaDB Media Schema Migration Confirmed Docs

- Dokumentiert die erfolgreich ausgefuehrte MariaDB-Schema-Migration fuer `remote_media_index`.
- Backup: `/opt/stream-control-center/_runtime_tmp/remote_modboard_before_remote_media_index_20260629_113811.sql`, Groesse `44K`.
- Readback: Tabelle existiert, Spalten vorhanden, Indizes vorhanden, `row_count = 0`.
- Keine Runtime-Code-Aenderung.
- Kein Service-Restart.
- Kein Webserver-Deploy.
- Keine Media-Daten-Writes.
