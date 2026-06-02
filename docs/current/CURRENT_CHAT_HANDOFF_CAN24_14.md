# Current Chat Handoff - CAN24.14

## Stand

CAN-24.14 abgeschlossen.

## Neu

Shadow-Hook ist im Execute-Pfad vorbereitet, aber default aus.

```text
allowedRewardKey: bauernweisheit
enabled: false
hookInstalled: true
```

## Wichtig

Kein Sound-Play, keine Queue, keine produktive Migration.

## Naechster Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-status" | ConvertTo-Json -Depth 10
```

Dann:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/bus/sound-shadow-dry-run/auto-test?rewardKey=bauernweisheit" | ConvertTo-Json -Depth 10
```

Erwartung bei enabled=false:

```text
skipped: true
reason: hook_disabled
```
