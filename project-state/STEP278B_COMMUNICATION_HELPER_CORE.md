# STEP278B — Communication Helper Core

## Status

Implemented as prepared helper core.

## Geänderte / neue Dateien

Added:

- `backend/modules/helpers/helper_communication.js`
- `config/communication_bus.json`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/STEP278B_COMMUNICATION_HELPER_CORE.md`

Updated:

- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`

## Ziel

Der erste zentrale Communication-Bus-Helper ist vorbereitet.

Er bietet:

- Client Registry
- Heartbeat Tracking
- Event-ID-Erzeugung
- Targeted `emit()`
- Ack Tracking
- Replayable Event Memory
- Issue Throttling
- Standalone-/Hosted-Overlay-Vorbereitung

## Bewusst nicht geändert

- keine bestehenden Module migriert
- kein Alert-/Sound-/TTS-/VIP-Umbau
- kein Dashboard-Umbau
- keine OBS-Änderung
- keine SQLite-Änderung
- kein Entfernen bestehender Funktionalität

## Tests

- `node --check backend/modules/helpers/helper_communication.js`
- JSON-Datei syntaktisch geprüft
