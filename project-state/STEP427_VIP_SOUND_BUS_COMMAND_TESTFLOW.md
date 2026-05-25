# STEP427 – VIP Sound-Bus Command Testflow

## Ziel
VIP-Sound-Wünsche werden zusätzlich als test-only `sound.command` EventBus-Command gespiegelt. Der produktive VIP-Flow bleibt unverändert und nutzt weiterhin das bestehende Sound-System per `/api/sound/play`.

## Geändert
- `backend/modules/vip_sound_overlay.js`

## Version
- `vip_sound_overlay`: 1.8.12

## Neue Diagnose-Routen
- `GET /api/vip-sound/eventbus/sound-command/status`
- `GET|POST /api/vip-sound/eventbus/sound-command/test`
- `GET|POST /api/vip-sound/eventbus/sound-command/reset`

Alias-Prefix bleibt ebenfalls verfügbar:
- `/api/vip-sound-overlay/eventbus/sound-command/*`

## Sicherheit
- testOnly: true
- shadowOnly: true
- VIP produktiver Flow bleibt `legacy_sound_system_api`
- keine Sound-Queue wird berührt
- kein Audio wird durch den Bus gestartet
- kein Overlay wird durch den Bus gesteuert
- keine Daily-Usage wird durch die Test-/Shadow-Schicht geschrieben

## Test
```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/reset" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/test?soundId=test_ping&requestedBy=ForrestCGN&message=STEP427" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 12
```

## Erwartung
- `version: 1.8.12`
- `feature: vip_sound_to_sound_bus_command_testflow`
- `mode: shadow_test`
- `stats.emitted: 1`
- `stats.errors: 0`
- `shadowOnly: true`
- `soundSystemTouched: false`
- `queueTouched: false`
- `audioTouched: false`
