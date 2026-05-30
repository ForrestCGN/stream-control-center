# Event-Bus Dashboard und DB-Config

Stand: STEP617C / 2026-05-30

Der Event-/Communication-Bus-Bereich wird im Dashboard ueber `htdocs/dashboard/modules/bus_diagnostics.js` angezeigt.

## Backend-Zustaendigkeit

Die Settings-API ist direkt in `backend/modules/communication_bus.js` integriert:

- `GET /api/communication/settings`
- `POST /api/communication/settings`
- `POST /api/communication/settings/reset-defaults?confirm=1`

Die DB-Tabelle heisst `communication_bus_settings`.

## DB-Regel

Settings werden ueber `backend/core/database.js` verwaltet. SQLite ist aktuell aktiv. MySQL/MariaDB bleiben ueber DB-Helper/Dialektfunktionen vorbereitet; es gibt keine direkte Dashboard-DB-Nutzung.

## Wichtige Abgrenzung

- `helper_communication.js` bleibt der Bus-Core.
- `communication_bus.js` ist Runtime-, Status-, Diagnose- und Settings-API des Bus.
- Kein separates `communication_bus_settings.js` verwenden.
- Runtime-Uebernahme der DB-Settings erfolgt nicht automatisch in diesem STEP.
