# CHANGELOG

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
