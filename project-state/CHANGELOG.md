# CHANGELOG

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

## 0.2.78 - Media Index 0.2.77 Live Confirm Docs Handoff

- Live-Bestaetigung von 0.2.77 dokumentiert.
- Festgehalten: Media-Index-Diff/Preview akzeptiert `rootKey = media` read-only.
- Festgehalten: Preview zeigt `media`-Items unter `.previews.newOnAgent`.
- Festgehalten: Kontextfelder `source`, `moduleKey`, `categoryKey`, `fullCategoryKey`, `assetRelativePath`, `webPath`, `publicPath` bleiben in Preview erhalten.
- Hinweis dokumentiert: `moduleBuild` zeigt noch globalen 0.2.28-Build, waehrend `statusApiVersion` und Verhalten 0.2.77 bestaetigen.
- Naechsten Anzeige-Polish-Block 0.2.79 vorbereitet.
- Keine Code-Dateien geaendert.

## 0.2.77 - Media Index Diff Media Root Readonly Verify

- `remote-modboard/backend/src/routes/media-index-diff.routes.js` erweitert.
- `MEDIA_ROOT_KEYS` akzeptiert jetzt auch `media`.
- Diff-/Preview-Sanitize erhaelt Media-System-Kontextfelder read-only.
- Webserver-Deploy/live fachlich bestaetigt.
- Keine DB-Writes/Gates/Deletes aktiviert.

## 0.2.76 - Media Index 0.2.75 Live Confirm Docs Handoff

- Live-Bestaetigung von 0.2.75 dokumentiert.
- Festgehalten: Remote-Modboard akzeptiert `rootKey = media` read-only.
- Festgehalten: `counts.media = 34` und `groups.media.count = 34`.
- Festgehalten: Kontextfelder `source`, `moduleKey`, `categoryKey`, `fullCategoryKey`, `assetRelativePath`, `webPath`, `publicPath` kommen remote an.
- Naechsten read-only Diff-/Preview-Verify-Block 0.2.77 vorbereitet.
- Keine Code-Dateien geaendert.

## 0.2.75 - Media Index Remote-Agent Media Root Remote Accept Readonly

- `remote-modboard/backend/src/services/agent-runtime.service.js` erweitert.
- Remote-Agent-Runtime akzeptiert jetzt `media` zusaetzlich zu `sounds`, `videos`, `images`.
- Remote-Sanitize fuer Media-Inventory und Full-Sync erhaelt Kontextfelder read-only.
- Webserver-Deploy/live bestaetigt.
- Keine DB-Writes/Gates/Deletes aktiviert.

## 0.2.74 - Media Index 0.2.73 Docs Handoff

- Doku-Stand nach lokal bestaetigtem 0.2.73 korrigiert.
- `CURRENT_STATUS.md`, `NEXT_STEPS.md`, `TODO.md`, `FILES.md` und New-Chat-Prompt auf den bestaetigten Stand gebracht.
- Festgehalten: Fuer 0.2.73 war kein Webserver-Deploy noetig, weil nur `backend/modules/remote_agent.js` im lokalen Agent betroffen war.
- Naechsten read-only Verify-Block 0.2.75 vorbereitet.
- Keine Code-Dateien geaendert.

## 0.2.73 - Media Index Remote-Agent Media-System Scan Inline Wiring

- `backend/modules/remote_agent.js` direkt inline erweitert.
- Neuer Root `media` fuer `htdocs/assets/media/<module>/<category>/...` im lokalen read-only Media-Inventory vorbereitet.
- Legacy-Roots `sounds`, `videos`, `images` bleiben erhalten.
- Inventory-Items koennen zusaetzliche Kontextfelder fuer Media-System-Sortierung enthalten.
- Lokal bestaetigt:
  - `moduleVersion = 0.1.8E`
  - `moduleBuild = RDAP_0.2.73_MEDIA_INDEX_REMOTE_AGENT_MEDIA_SYSTEM_SCAN_INLINE_WIRING`
  - `statusApiVersion = rdap_agent_media_inventory_media_system_scan_073.v1`
  - `readOnly = True`
  - `writeEnabled = False`

## 0.2.72 - Media Index Remote-Agent Inline Wiring Handoff

- Handoff nach Entfernung von `helper_media_inventory_roots.js` dokumentiert.
- Naechsten Inline-Wiring-Step fuer `remote_agent.js` vorbereitet.
- Keine Runtime-Source-Aenderung in diesem ZIP.
