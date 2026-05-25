# STEP426 - Sound Bus Command Test Layer

## Ziel

Das Sound-System bekommt eine sichere EventBus-Command-Testschicht. Diese Schicht bereitet spätere Bus-Commands wie `sound.play.request` vor, ohne die produktive Sound-API oder Queue zu verändern.

## Neue Routen

- `GET /api/sound/eventbus/command/status`
- `GET /api/sound/eventbus/command/test`
- `POST /api/sound/eventbus/command/test`
- `GET /api/sound/eventbus/command/reset`

## Schutz

- `testOnly: true`
- `commandConsumerEnabled: false`
- `soundSystemTouched: false`
- `queueTouched: false`
- `audioTouched: false`
- Legacy `/api/sound/play` bleibt produktiver Einstieg.
- Keine VIP-/Alert-Umstellung in diesem Step.

## Erwarteter Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/test?sound=test_ping&requestedBy=ForrestCGN&message=STEP426" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/status" | ConvertTo-Json -Depth 10
```

Erwartung: `version: 0.1.15`, `capability: sound.command_input`, `commandLayerReady: true`, `commandConsumerEnabled: false`, `queueTouched: false`, `audioTouched: false`, `stats.emitted: 1`, `stats.errors: 0`.
