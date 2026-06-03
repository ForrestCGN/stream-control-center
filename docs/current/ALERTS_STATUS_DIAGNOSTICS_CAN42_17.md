# CAN-42.17 - Alerts Status-Diagnostics

## Ziel

`/api/alerts/status` soll denselben zentralen Diagnostics-Standard liefern wie die bereits angeglichenen Module Commands, Hug, Message-Rotator, VIP-Sound, Sound-System und Media.

Die zentrale Admin-Diagnose kann dadurch Alerts generisch auswerten und im bestehenden Standard-Diagnoseblock anzeigen.

## Geänderte Datei

```text
backend/modules/alert_system.js
```

## Änderungen

- `MODULE_VERSION` von `3.1.9` auf `3.1.10` erhöht.
- `MODULE_BUILD = 'diagnostics-standard'` ergänzt.
- `MODULE_META.build` ergänzt.
- `buildStandardDiagnostics(counts, ffprobe)` ergänzt.
- `/api/alerts/status` ergänzt um:
  - `moduleVersion`
  - `moduleBuild`
  - `diagnosticVersion`
  - `routes`
  - `routeCount`
  - `dataEndpoints`
  - `diagnostics`
- `module.exports.getStatus` ergänzt.

## Diagnostics-Inhalt

Der neue `diagnostics`-Block enthält:

- `counts`: Alert-Typen, Regeln, Assets, Events, Textvarianten, Presets, Display-Profile, Chat-Blöcke, Queue, History, Overlay-Clients, Routen, AlertOutput/EventBus/CanBus und Sound-Korrelation.
- `database`: Adapter, Pfad, Schema-Version, erwartete Schema-Version und Fehlerstatus.
- `state`: Enabled-/Overlay-/Queue-/Upload-Status, Processing, aktuelles Event, Overlay-Clients, multer/ffprobe, CanBus, AlertBusMirror und AlertOutput.
- `warnings`, `errors`, `lastError`.

## Nicht geändert

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

## Test

```powershell
.\stepdone.cmd "CAN-42.17 Alerts status diagnostics-standard"

node -c backend\modules\alert_system.js

$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"
$a | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,enabled,overlayEnabled,queueEnabled,routeCount
$a.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$a.diagnostics.counts
```

Dashboard:

```text
Admin > Diagnose > Alerts
```
