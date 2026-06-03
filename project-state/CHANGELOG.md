# Changelog

## CAN-43.14

- `bus_diagnostics` als dreizehntes CAN-43-Fachmodul per Batch-Export geprüft.
- Echte Backend-Datei `backend/modules/bus_diagnostics.js` dokumentiert.
- Live-Status von `/api/bus-diagnostics/status` dokumentiert.
- Routenübersicht `/api/bus-diagnostics/routes` dokumentiert.
- Read-only-Modus dokumentiert.
- Summary-Status `ok` dokumentiert.
- Optionale Debug-Client-Hinweise dokumentiert.
- Keine Codeänderung.
- Keine produktiven Flows.

## CAN-43.13

- `overlay_monitor` als zwölftes CAN-43-Fachmodul per Batch-Export geprüft.
- Echte Backend-Datei `backend/modules/overlay_monitor.js` dokumentiert.
- Live-Status von `/api/overlay-monitor/status` dokumentiert.
- `diagnostics`-Block dokumentiert.
- Client-Control, Classification, Identity-Contract, Issues, OBS-Inventar, Events und Routes dokumentiert.
- Manuelle OBS-Reparaturroute als nicht ausgelöst dokumentiert.
- Keine Codeänderung.
- Keine OBS-Reparatur.
- Kein Browserquellen-Refresh.
- Keine produktiven Flows.

## Batch-Erkenntnis

- `communication_bus` wurde mit falschen `/api/communication-bus/*`-URLs abgefragt.
- Echte bekannte Route laut `bus_diagnostics`: `/api/communication/status`.
- `communication_bus` bleibt offen für CAN-43.15.
