# CHANGELOG

## CAN-42.20

- `backend/modules/communication_bus.js` auf Diagnostics-Standard erweitert.
- `MODULE_META.version` von `0.8.3` auf `0.8.4` erhöht.
- `MODULE_META.build` auf `diagnostics-standard` gesetzt.
- `/api/communication/status` liefert zusätzlich `moduleBuild`, `diagnosticVersion`, `routes`, `routeCount`, `dataEndpoints` und `diagnostics`.
- Produktive Bus-, WebSocket-, Replay-, Watchdog- und Settings-Logik unverändert gelassen.
