# STEP428 – Sound-System Command-Consumer Dry-Run

## Ziel

Das Sound-System kann `sound.command` Play-Requests im Dry-Run validieren, ohne Audio zu starten oder die Queue zu verändern.

## Geändert

- `backend/modules/sound_system.js`

## Neue Version

- `sound_system` `0.1.16`

## Neue/erweiterte Routen

- `GET /api/sound/eventbus/command/status`
- `GET /api/sound/eventbus/command/dry-run`
- `POST /api/sound/eventbus/command/dry-run`
- bestehende Test-/Reset-Routen bleiben erhalten

## Schutz

- `dryRunOnly: true`
- `queueTouched: false`
- `audioTouched: false`
- `legacyApiFlow: unchanged`
- `legacyWebSocketFlow: unchanged`

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/reset" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/dry-run?soundId=test_ping&requestedBy=ForrestCGN&message=STEP428" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/status" | ConvertTo-Json -Depth 12
```

## Erwartung

- `version: 0.1.16`
- `feature: sound_bus_command_dry_run_layer`
- `commandConsumerEnabled: true`
- `commandConsumerMode: dry_run`
- `accepted: true`
- `wouldPlay: true`
- `queueTouched: false`
- `audioTouched: false`
