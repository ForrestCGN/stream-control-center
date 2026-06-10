# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Direkt nach Installation testen

```powershell
node -c .\backend\modules\twitch_events.js
$l = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/eventsub/live-readiness"
$l.liveReadiness.checks | Select-Object id,label,required,status,value,error
```

## Danach

```text
BUS-TWITCH.6 – EventSub Chat guarded enable planen, nur wenn Live-Readiness passt.
```

Wichtig: EventSub-Subscription erst mit gesondertem Go aktivieren.
