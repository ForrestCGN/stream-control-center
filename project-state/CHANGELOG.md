# CHANGELOG

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
