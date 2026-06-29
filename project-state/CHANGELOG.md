# CHANGELOG

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
