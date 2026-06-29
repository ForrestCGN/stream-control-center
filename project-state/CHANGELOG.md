# CHANGELOG

## 0.2.55C - Media Full-Sync Build Marker Sync

- Build-/Statusmarker nach 0.2.55B auf `RDAP_0.2.55C_MEDIA_FULL_SYNC_BUILD_MARKER_SYNC` synchronisiert.
- `agent-runtime.service.js`, `media-readonly.routes.js` und `routes.routes.js` melden denselben 0.2.55C Build.
- Keine Logik-Aenderung, keine Gate-Aktivierung, keine DB-Writes, keine UI-Read-Source-Umstellung.


## 0.2.55B - Media Full-Sync Active Write Completion State

- `remote-modboard/backend/src/services/agent-runtime.service.js` zaehlt Full-Sync-Chunks jetzt als eindeutige Chunk-Indizes.
- Aktiv geschriebene Full-Syncs koennen durch asynchron fertig werdende Chunks nicht mehr von `complete` auf `chunk` zurueckfallen.
- `receivedChunks` zeigt die Anzahl eindeutig empfangener/geschriebener Chunks.
- `completedAt` bleibt bei komplettem Full-Sync gesetzt.
- `media-readonly.routes.js` und `routes.routes.js` melden den 0.2.55B Build.
- Keine Gate-Aktivierung, keine UI-Read-Source-Umstellung, keine Upload/Edit/Delete-Funktion.


## 0.2.55A - Media Full-Sync Blocked-State Clarity

- `remote-modboard/backend/src/services/agent-runtime.service.js` zeigt vollstaendig empfangene Full-Sync-Chunks bei deaktivierten MEDIA_INDEX-Gates als `received_write_blocked` statt `pending`.
- Bei gate-blockiertem Komplett-Empfang wird `completedAt` gesetzt.
- `lastError` bleibt als Gate-Grund sichtbar.
- `remote-modboard/backend/src/routes/media-readonly.routes.js` und `routes.routes.js` melden den 0.2.55A Build.
- Keine DB-Writes aktiviert.
- Keine UI-DB-Read-Umstellung.
- Keine Upload/Edit/Delete-Funktion.

## 0.2.55 - Media Full-Sync Chunk Receiver

- `backend/modules/remote_agent.js` sendet zusaetzliche Media-Full-Sync-Chunks.
- `remote-modboard/backend/src/services/agent-runtime.service.js` nimmt Full-Sync-Chunks an, validiert streng und schreibt nur bei aktiven MEDIA_INDEX-Gates in `remote_media_index`.
- `remote-modboard/backend/src/routes/media-readonly.routes.js` zeigt Full-Sync-Status im Media-Status.
- `remote-modboard/backend/src/routes/routes.routes.js` beschreibt den 0.2.55 Media-Status.
- Keine UI-DB-Read-Umstellung.
- Keine Upload/Edit/Delete-Funktion.
- Keine Datei-Inhalte, keine absoluten Pfade.

## 0.2.54A - Media Agent Inventory Source Fix

- Fix in `backend/modules/remote_agent.js`.
- `preparedMediaInventory()` nutzt keine nicht definierte `source`-Variable mehr.
- Lokale Route `/api/remote-agent/media/inventory/status` kann wieder antworten.
- Agent-Media-Inventory-Frame-Build ist wieder moeglich.
- Keine DB-Writes, keine Schema-Writes, keine Media-Datenwrites.
