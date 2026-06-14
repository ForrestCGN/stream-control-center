# CAN44.41 Manual Override Lock Fix

## Ziel
Der Stream-State Manual Override muss während seiner aktiven TTL die harte Wahrheit sein. Ein bestätigter manueller Online-Override darf nicht direkt beim nächsten Refresh durch `live_status_monitor` wieder auf `ending/offline` überschrieben werden.

## Dateien
- `backend/modules/twitch_events.js`
- `htdocs/dashboard/modules/live_status_monitor.js`
- `htdocs/dashboard/modules/live_status_monitor.css`

## Änderungen
- `twitch_events` Version `0.1.12`, Build `CAN44.41_MANUAL_OVERRIDE_LOCK`.
- Aktiver `manualOverride` setzt jetzt auch `provider: manual_override` und überschreibt Status/SessionStatus/Live-Quelle vollständig.
- Confirmed-Online-Override bleibt bei nachfolgenden Status-Refreshs `status=live`, `live=true`, `provider=manual_override`.
- `live_status_monitor` darf einen aktiven Override nicht sofort wieder auf `ending/offline` kippen.
- Dashboard-Dateien aus CAN44.40 bleiben enthalten, damit die Override-Buttons vorhanden bleiben.

## Erwarteter Test
```powershell
node -c "D:\Streaming\stramAssets\backend\modules\twitch_events.js"
node -c "D:\Streaming\stramAssets\htdocs\dashboard\modules\live_status_monitor.js"

$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$t.moduleVersion
$t.diagnostics.streamState.moduleBuild
```

Erwartet:
```text
0.1.12
CAN44.41_MANUAL_OVERRIDE_LOCK
```

Confirmed Online Override:
```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:8080/api/twitch/events/stream-state/override" `
  -ContentType "application/json" `
  -Body '{"live":true,"status":"live","confirmed":true,"forceConfirmed":true,"streamId":"manual_dashboard_test","reason":"manual_confirmed_test","ttlMs":600000}' |
  ConvertTo-Json -Depth 10

$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$t.diagnostics.streamState.status
$t.diagnostics.streamState.live
$t.diagnostics.streamState.provider
$t.diagnostics.streamState.source
$t.diagnostics.streamState.lastEventKey
$t.diagnostics.streamState.streamSession | ConvertTo-Json -Depth 10
```

Erwartet:
```text
status = live
live = True
provider = manual_override
source = manual_override
lastEventKey = twitch.stream.online
```

Override löschen:
```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:8080/api/twitch/events/stream-state/clear-override" `
  -ContentType "application/json" `
  -Body '{"reason":"manual_override_lock_test_done"}' |
  ConvertTo-Json -Depth 10
```

## StepDone
```cmd
.\stepdone.cmd "CAN44.41 Manual Override Lock Fix"
```
