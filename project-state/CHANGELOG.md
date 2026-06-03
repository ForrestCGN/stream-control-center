# CHANGELOG

## CAN-42.17 - Alerts Status-Diagnostics

Geändert:

- `backend/modules/alert_system.js`
  - `MODULE_VERSION` auf `3.1.10` erhöht.
  - `MODULE_BUILD = "diagnostics-standard"` ergänzt.
  - `MODULE_META.build` ergänzt.
  - Read-only Helper `buildStandardDiagnostics()` ergänzt.
  - `/api/alerts/status` liefert zusätzlich `moduleVersion`, `moduleBuild`, `diagnosticVersion`, `routes`, `routeCount`, `dataEndpoints` und `diagnostics`.
  - `module.exports.getStatus` ergänzt.

Der neue `diagnostics`-Block enthält:

- `counts` für Alert-Typen, Regeln, Assets, Events, Textvarianten, Presets, Display-Profile, Chat-Blöcke, Queue, Overlay-Clients, Routen, AlertOutput/EventBus/CanBus und Sound-Korrelation.
- `database` mit Adapter, Pfad, Schema-Version und erwarteter Schema-Version.
- `state` mit Enabled-/Overlay-/Queue-/Upload-Status, Processing, aktuellem Event, Overlay-Clients, multer/ffprobe, CanBus und AlertOutput.
- `warnings`, `errors`, `lastError`.

Nicht geändert:

- keine Alert-Ausführung
- keine Queue-/Clear-/Reload-/Enqueue-/Test-Logik
- keine Twitch-/Provider-Routen
- keine Rules-/Assets-/Upload-/Duration-Scan-Logik
- keine EventBus-/Overlay-Watchdog-/Bus-Mirror-Produktivlogik
- keine DB-Migration
- keine Dashboard-Dateien
- keine Funktionalität entfernt
