# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Direkt nach Installation testen

```powershell
node -c .\backend\modules\commands.js
node -c .\backend\modules\twitch_presence.js
```

```powershell
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/commands/bus-chat/status"
$c.busChat | Select-Object enabled,active,autostart,subscriptionId,lastError
```

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/command-direct/status"
$p.commandDirectHook | Select-Object enabled,mode,lastResultReason,lastError
```

## Erwartung nach Backend-Neustart

```text
commands busChat enabled=true active=true autostart=true
twitch_presence commandDirectHook enabled=false mode=disabled
```

## Danach

```text
BUS-TWITCH.10 – produktiven Bus-Command-Betrieb beobachten und ggf. weitere Module als Subscriber anbinden.
```
