# CHANGELOG

## CAN-42.19 - Overlay-Monitor Status-Diagnostics

- `backend/modules/overlay_monitor.js` aktualisiert.
- Version von `0.1.8` auf `0.1.9` erhöht.
- `MODULE_BUILD = diagnostics-standard` ergänzt.
- `/api/overlay-monitor/status` um Standardfelder ergänzt:
  - `moduleVersion`
  - `moduleBuild`
  - `diagnosticVersion`
  - `routes`
  - `routeCount`
  - `dataEndpoints`
  - `diagnostics`
- `module.exports.getStatus` ergänzt.
- `/api/overlay-monitor/routes` nutzt jetzt dieselbe zentrale Routenliste wie der Status.
- Keine Overlay-Refresh-, OBS-Repair-, Communication-Bus-, Monitoring-Issue-, Inventar-Refresh-, Dashboard- oder DB-Migrationslogik geändert.
- Keine Funktionalität entfernt.
