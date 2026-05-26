# STEP430 – Sound Command Consumer Play-Test

## Ziel
Das Sound-System kann einen Bus-förmigen `sound.play.request` über eine explizite Test-Route ausführen.

## Geändert
- `backend/modules/sound_system.js`

## Neue Version
- `sound_system`: `0.1.17`

## Neue Route
- `GET/POST /api/sound/eventbus/command/play-test`

## Schutz
- Kein produktiver VIP-Flow geändert.
- Kein Alert-Flow geändert.
- Kein automatischer Bus-Consumer aktiviert.
- Der echte Soundstart passiert nur über die explizite Play-Test-Route.
- `legacy /api/sound/play` bleibt unverändert.

## Test
```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/reset" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/play-test?soundId=test_ping&requestedBy=ForrestCGN&message=STEP430" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/status" | ConvertTo-Json -Depth 12
```

## Erwartung
- `version: 0.1.17`
- `feature: sound_bus_command_play_test_layer`
- `accepted: true`
- `playTestOk: 1`
- Sound kann starten oder korrekt queueen.
