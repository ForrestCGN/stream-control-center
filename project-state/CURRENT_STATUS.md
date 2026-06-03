# CURRENT_STATUS

## Aktueller Arbeitsstand CAN-42.17

CAN-42.17 vorbereitet: Alerts `/api/alerts/status` liefert zusätzlich einen standardisierten `diagnostics`-Block für die zentrale Admin-Diagnose.

Geändert:

```text
backend/modules/alert_system.js
```

Ergebnis:

- `MODULE_VERSION` wurde auf `3.1.10` erhöht.
- `MODULE_BUILD` wurde als `diagnostics-standard` ergänzt.
- `MODULE_META.build` wurde ergänzt.
- `/api/alerts/status` liefert zusätzlich:
  - `moduleVersion`
  - `moduleBuild`
  - `diagnosticVersion`
  - `routes`
  - `routeCount`
  - `dataEndpoints`
  - `diagnostics`
- Der `diagnostics`-Block enthält `counts`, `database`, `state`, `warnings`, `errors` und `lastError`.
- `module.exports.getStatus` wurde ergänzt.

Nicht geändert:

```text
Alert-Ausführung
Queue-/Clear-/Reload-/Enqueue-/Test-Logik
Twitch-/Provider-Routen
Rules-/Assets-/Upload-/Duration-Scan-Logik
EventBus-/Overlay-Watchdog-/Bus-Mirror-Produktivlogik
DB-Migrationen
Dashboard-Dateien
```

Keine Funktionalität entfernt.
