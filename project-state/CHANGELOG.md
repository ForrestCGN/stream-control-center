# CHANGELOG

## CAN-31.1

- `backend/server.js` WebSocket connect/disconnect Logging vorbereitet:
  - Einzelne `[WS] client connected` / `[WS] client disconnected` Zeilen werden nicht mehr pro Client ausgegeben.
  - Neue gedrosselte Summary:
    - `[WS] clients=... connectedDelta=... disconnectedDelta=... connectedTotal=... disconnectedTotal=...`
  - `/api/_status` ergänzt um `wsLogSummaryVersion` und `wsLogSummary`.
  - `SERVER_VERSION` auf `0.1.2-can31-1-ws-log-summary` erhöht.
- Keine WebSocket-Funktionalität geändert:
  - Dispatch bleibt unverändert.
  - Broadcast bleibt unverändert.
  - Modul-Handler bleiben unverändert.
  - Routen bleiben unverändert.

## CAN-30.1

- SQLite ExperimentalWarning dokumentiert.
- Ursache festgehalten:
  - `backend/modules/sqlite_core.js`
  - `require("node:sqlite")`
  - `DatabaseSync`
- Keine Codeänderung, keine DB-Änderung, kein Treiberwechsel.

## CAN-29.2

- Erfolgreichen Live-Test von CAN-29.1 dokumentiert.
- Discord.js DeprecationWarning `ready -> clientReady` erscheint nicht mehr.

## CAN-28.2

- Erfolgreichen Live-Test von CAN-28.1 dokumentiert.
- `obs_shared.js` wird korrekt als Shared-Helper ohne init geloggt.
