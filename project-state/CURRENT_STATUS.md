# Current Status

## Aktueller Stand

CAN-42 Diagnose-Aufräumrunde ist abgeschlossen.

CAN-43.0 wurde als Startpunkt für die nächste Fachrunde vorbereitet.

CAN-43.1 aktualisierte die Projektübergabe für den neuen Chat.

CAN-43.2 bis CAN-43.12 haben mehrere Registry-Module nach neuem Diagnose-/Registry-Standard geprüft und dokumentiert.

CAN-43.13 hat `overlay_monitor` geprüft und dokumentiert.

CAN-43.14 hat `bus_diagnostics` geprüft und dokumentiert.

## CAN-43.13 Ergebnis

`overlay_monitor` ist sauber.

- Backend-Datei: `backend/modules/overlay_monitor.js`
- Modulversion: `0.1.9`
- Build: `diagnostics-standard`
- Status-API-Version: `1.0.9`
- Statusroute: `GET /api/overlay-monitor/status`
- Feature: `overlay_monitor_read_only`
- Read-only: `True`
- Overlay touched: `False`
- OBS touched: `False`
- Refresh touched: `False`
- RouteCount: `9`
- Overlays: `10`
- Online: `7`
- Expected Inactive: `1`
- Expected Idle: `2`
- With Heartbeat: `10`
- Active Issues: `0`
- Diagnostics: `ok=True`, `health=ok`, `schemaReady=True`
- Warnings/Errors: keine
- Codeänderung: keine

## CAN-43.14 Ergebnis

`bus_diagnostics` ist sauber.

- Backend-Datei: `backend/modules/bus_diagnostics.js`
- Modulversion: `1.2.9`
- Status-API-Version: `1.0.0`
- Statusroute: `GET /api/bus-diagnostics/status`
- Routenübersicht: `GET /api/bus-diagnostics/routes`
- Feature: `bus_dashboard_diagnostics`
- Mode: `read_only_dashboard_preparation`
- Summary Status: `ok`
- Warnings: keine
- Errors: keine
- Optional Info: Debug-Clients nicht verbunden
- Codeänderung: keine

## Coverage

Letzter bestätigter Coverage-Stand aus Batch:

- `ok: True`
- `registryEntries: 14`
- `loadedModules: 52`
- `coveredLoadedModules: 14`
- `missingLoadedModules: 0`
- `registryOnlyEntries: 0`

## Offener Punkt

`communication_bus` wurde im Batch mit falschen URLs abgefragt und ist noch nicht als eigener CAN-Step abgeschlossen.

Echte bekannte Route aus `bus_diagnostics`:

```text
/api/communication/status
```

## Neue Modul-Regel

Bei neuen oder geänderten Modulen muss direkt geprüft werden:

- Statusroute
- `diagnostics`-Block
- Registry-Eintrag
- Coverage-Test
- Doku/project-state
- keine neue Dashboard-Diagnose-Extra-Datei ohne explizite Begründung
