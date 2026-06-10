# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Direkt nach Installation testen

```powershell
node -c .\backend\modules\twitch.js
node -c .\backend\modules\twitch_events.js
```

```powershell
$d = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/auth/scope-diagnostics"
$d | Select-Object ok,module,moduleVersion,moduleBuild,hasUserReadChatConfigured,hasUserReadChatInToken
$d.missingConfiguredScopes
```

## Falls user:read:chat noch im Token fehlt

```text
Browser öffnen:
http://127.0.0.1:8080/auth/login?force=1
```

Danach ForrestCGN neu autorisieren, Backend neu starten und erneut testen:

```powershell
$l = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/eventsub/live-readiness"
$l.liveReadiness.checks | Select-Object id,label,required,status,value,error
```

## Danach

```text
BUS-TWITCH.6 – EventSub Chat guarded enable erst planen, wenn user_read_chat_scope = ok ist.
```

Wichtig: EventSub-Subscription bleibt weiter gesperrt, bis ein gesondertes Go erfolgt.
