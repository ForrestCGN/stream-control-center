# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Direkt testen nach BUS-TWITCH.14

```powershell
node -c .\backend\modules\twitch.js
node -c .\backend\modules\twitch_events.js
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,health,lastError
```

```powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/channelpoints-parallel/status"
$p.channelpointsTwitchEventsParallel
```

Nach einer Channelpoints-Einlösung:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$s.diagnostics.counts.byEvent.'twitch.channelpoints.redemption.created'
```

## Nächster fachlicher Step

```text
BUS-TWITCH.15 – VIP30 Subscriber auf twitch.channelpoints.redemption.created vorbereiten
```

Wichtig: Altweg bleibt bis erfolgreichem Test aktiv.
