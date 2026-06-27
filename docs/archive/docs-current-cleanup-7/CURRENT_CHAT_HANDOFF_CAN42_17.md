# Current Chat Handoff - CAN42.17

## Stand

CAN-42.17 ist vorbereitet: Alerts `/api/alerts/status` liefert zusätzlich einen standardisierten `diagnostics`-Block für die zentrale Admin-Diagnose.

## Geänderte Dateien

```text
backend/modules/alert_system.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/ALERTS_STATUS_DIAGNOSTICS_CAN42_17.md
docs/current/CURRENT_CHAT_HANDOFF_CAN42_17.md
```

## Wichtig

- Keine Alert-Ausführung geändert.
- Keine Queue-/Clear-/Reload-/Enqueue-/Test-Logik geändert.
- Keine Twitch-/Provider-Routen geändert.
- Keine Rules-/Assets-/Upload-/Duration-Scan-Logik geändert.
- Keine EventBus-/Overlay-Watchdog-/Bus-Mirror-Produktivlogik geändert.
- Keine DB-Migration.
- Keine Dashboard-Dateien.
- Keine Funktionalität entfernt.

## Test nach Entpacken

```powershell
.\stepdone.cmd "CAN-42.17 Alerts status diagnostics-standard"

node -c backend\modules\alert_system.js

$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status"
$a | Select-Object ok,module,moduleVersion,moduleBuild,version,diagnosticVersion,enabled,overlayEnabled,queueEnabled,routeCount
$a.diagnostics | Select-Object ok,health,module,version,build,schemaVersion,schemaReady,lastError
$a.diagnostics.counts
```

Danach Dashboard hart neu laden (`STRG+F5`) und prüfen:

```text
Admin > Diagnose > Alerts
```

## Nächster sinnvoller Schritt

CAN-42.18: Birthday oder Overlay-Monitor Statusroute/Diagnostics prüfen.
