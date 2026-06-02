# CHANGELOG

## CAN-31.2

- Erfolgreichen Live-Test von CAN-31.1 dokumentiert.
- Bestätigtes Ergebnis:
  - WebSocket-Connect-Spam wurde durch Summary-Zeilen ersetzt.
  - Beispiel:
    - `[WS] clients=15 connectedDelta=15 disconnectedDelta=0 connectedTotal=15 disconnectedTotal=0`
    - `[WS] clients=16 connectedDelta=1 disconnectedDelta=0 connectedTotal=16 disconnectedTotal=0`
  - Modul-Loader bleibt sauber mit `loaded=52`, `skipped=1`, `failed=0`, `warnings=0`, `duplicateRoutes=0`.
  - Discord bleibt ready.
- Keine Codeänderung in CAN-31.2.

## CAN-31.1

- `backend/server.js` WebSocket connect/disconnect Logging umgesetzt:
  - Einzelne `[WS] client connected` / `[WS] client disconnected` Zeilen werden nicht mehr pro Client ausgegeben.
  - Neue gedrosselte Summary:
    - `[WS] clients=... connectedDelta=... disconnectedDelta=... connectedTotal=... disconnectedTotal=...`
  - `/api/_status` ergänzt um `wsLogSummaryVersion` und `wsLogSummary`.
  - `SERVER_VERSION` auf `0.1.2-can31-1-ws-log-summary` erhöht.
- Keine WebSocket-Funktionalität geändert.

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
