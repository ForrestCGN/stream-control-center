# CHANGELOG

## 0.2.95 - Media Index Context Read API Docs Handoff

- Doku nach live bestaetigter 0.2.94 Context-Read-API aktualisiert.
- Festgehalten: `/api/remote/media/index/context/list` liefert read-only Kontext-/Media-Listen aus `remote_media_index`.
- Festgehalten: Live-Checks bestaetigen `root_key=media total=412`, `module_key=alerts total=132`, `full_category_key=alerts/follow total=53`.
- Festgehalten: 0.2.94 wurde ohne neues Modul umgesetzt; geaendert wurden nur `media-index-diff.routes.js` und `routes.routes.js`.
- Naechsten read-only UI-/Media-Picker-Planblock vorbereitet.
- Keine Runtime-Code-Dateien geaendert.
- Kein Webserver-Deploy noetig.

## 0.2.94 - Media Index DB Context Read API readonly fixed

- Bestehende Route-Datei `remote-modboard/backend/src/routes/media-index-diff.routes.js` erweitert.
- `/api/remote/routes` in `remote-modboard/backend/src/routes/routes.routes.js` ergaenzt.
- Neue read-only Route: `GET /api/remote/media/index/context/list`.
- Filter: `root_key`, `module_key`, `category_key`, `full_category_key`, `kind`, `limit`, `offset`.
- Live bestaetigt: `readOnly=true`, `writeEnabled=false`, `databaseWriteExecuted=false`.
- Live bestaetigt: `media=412`, `alerts=132`, `alerts/follow=53`.
- Keine DB-Writes, keine Gates, keine Migration, kein neues Modul, keine `app.js`-Aenderung.

## 0.2.93 - Media Index Post-Upsert Verify readonly

- Post-Upsert-Verifikation nach produktivem Context-Upsert read-only ausgefuehrt.
- Bestaetigt: FullSyncCompare `fullItems=744`, DB `dbTotal=744`, `newOnAgent=0`.
- Bestaetigt: Upsert Preview `ok=true`, `candidateCount=0`, `byRoot={}`, `byKind={}`.
- Bestaetigt: DB-Readback `images=46`, `media=412`, `sounds=276`, `videos=10`, gesamt `744` aktive Eintraege.
- Bestaetigt: Audit-Eintraege fuer `media_index.schema_extension.add_context_columns` und `media_index.upsert.with_context` jeweils `success`.
- Bestaetigt: Media-Index-Gates bleiben geschlossen. `MEDIA_INDEX_SCHEMA_WRITE_ENABLED` war nicht explizit gesetzt, faellt im Code aber sicher auf `false`.
- Naechsten read-only API-Block 0.2.94 vorbereitet.
- Keine Runtime-Code-Dateien geaendert.
- Kein Webserver-Deploy noetig.

## 0.2.92 - Media Index DB Upsert Docs Handoff

- Doku nach erfolgreichem Schema- und Data-Upsert aktualisiert.
- Festgehalten: `remote_media_index` enthaelt jetzt `images=46`, `media=412`, `sounds=276`, `videos=10`, gesamt `744` aktive Eintraege.
- Festgehalten: Media-System-Kontextspalten sind vorhanden und befuellt: `module_key`, `category_key`, `full_category_key`, `asset_relative_path`, `web_path`, `public_path`.
- Festgehalten: produktiver Upsert war erfolgreich mit `candidateCount=412`, `affectedRows=412`, `presentAfterCount=412`, `missingAfterCount=0`, `auditWritten=true`.
- Festgehalten: Gates muessen nach Execute wieder geschlossen sein.
- Naechsten read-only Verify-Block 0.2.93 vorbereitet.
- New-Chat-Prompt nach 0.2.91 erstellt.
- Keine Runtime-Code-Dateien geaendert.

## 0.2.91 - Media Index Upsert Candidates Field Fix gated

- `remote-modboard/backend/src/routes/media-index-diff.routes.js` korrigiert.
- Execute-Snapshot gibt jetzt `candidates` zurueck.
- Gate-false Test bestaetigt: `candidateCount=412`, `databaseWriteExecuted=false`, `upsertExecuted=false`.
- Produktiver Upsert hinter Gates erfolgreich ausgefuehrt.
- Readback bestaetigt: `media=412`, Kontextfelder gefuellt, Audit geschrieben.

## 0.2.90 - Media Index Upsert Candidates Fix gated

- `remote-modboard/backend/src/routes/media-index-diff.routes.js` abgesichert.
- Fehlendes Candidate-Array erzeugt keinen 500 mehr, sondern blockiert sicher.
- Keine DB-Writes ausgefuehrt.

## 0.2.89 - Media Index Upsert with Context gated

- `remote-modboard/backend/src/routes/media-index-diff.routes.js` erweitert.
- Gated Data-Upsert fuer `remote_media_index` mit Kontextspalten implementiert.
- Erster Execute zeigte 500 wegen fehlendem `snapshot.candidates`.
- Per SQL bestaetigt: kein Write passiert, `media` war danach noch nicht in der DB.

## 0.2.88 - Media Index Schema Extension Execute gated

- `remote-modboard/backend/src/routes/media-index-diff.routes.js` erweitert.
- Echte Schema-Erweiterung hinter Gates ausgefuehrt.
- Spalten hinzugefuegt: `module_key`, `category_key`, `full_category_key`, `asset_relative_path`, `web_path`, `public_path`.
- Readback: `missingColumnCount=0`, `allColumnsPresent=true`.
- Audit geschrieben.

## 0.2.87 - Media Index Schema Extension Foundation blocked

- Schema-Extension Preview/Execute Foundation vorbereitet.
- Preview bestaetigte 6 fehlende Kontextspalten.
- Execute default blockiert, kein ALTER TABLE.

## 0.2.86 - Media Index Upsert Execute Foundation blocked

- Upsert-Execute-Route vorbereitet.
- LocalOnly, Confirm, expectedCandidateCount und Gates eingebaut.
- Gate-false Test bestaetigt, kein DB-Write.

## 0.2.85 - Media Index Upsert Preview readonly

- Read-only Upsert-Preview ergaenzt.
- Bestaetigt: `candidateCount=412`, `byRoot.media=412`, `byKind.audio=335`, `image=42`, `video=35`.

## 0.2.83 - Media Index Diff FullSync Summary readonly

- FullSync Summary ueber komplette Listen ergaenzt.
- Bestaetigt: 412 neue `media`-Items im Agent-FullSync gegen DB.

## 0.2.79 bis 0.2.82 - Media Index Diff/DB Readiness readonly

- Route-Build-Anzeige bereinigt.
- FullSyncCompare und DB-Readiness bestaetigt.
- Ergebnis: FullSync 744 Items, DB vorher 332 Legacy-Items, 412 neue `media`-Items.
