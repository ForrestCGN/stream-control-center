# STEP278H — Communication WS Client Registration

## Status

Implemented as optional WS client registration.

## Geänderte Dateien

- `backend/server.js`
- `backend/modules/communication_bus.js`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/STEP278H_COMMUNICATION_WS_CLIENT_REGISTRATION.md`

## Aktualisierte Dateien

- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Neu

WebSocket-Clients können senden:

- `hello`
- `heartbeat`
- `ack`
- `bus_ack`

## Wichtig

- Keine Produktivmodule wurden migriert.
- `broadcastWS` bleibt unverändert.
- Unbekannte WS-Messages werden nicht blockiert.
- Keine Dashboard-/DB-/OBS-Änderung.

## Tests

- `node --check backend/server.js`
- `node --check backend/modules/communication_bus.js`
- Smoke-Test:
  - Modul lädt
  - `handleWsMessage()` registriert hello
  - Status enthält Client
