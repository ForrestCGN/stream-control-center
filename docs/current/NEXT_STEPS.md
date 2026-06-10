# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Direkt testen

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/channelpoints-parallel/status"
$p.channelpointsTwitchEventsParallel
```

Danach eine Channelpoints-Einlösung auslösen und prüfen:

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/channelpoints-parallel/status"
$p.channelpointsTwitchEventsParallel | Select-Object forwarded,duplicateSkipped,failed,lastForwardSource,lastRewardTitle,lastResultReason,lastError
```

## Danach

```text
BUS-TWITCH.15 erneut mit echtem VIP30-Reward testen.
```
