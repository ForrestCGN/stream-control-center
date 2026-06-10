# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Direkt testen

```powershell
node -c .\backend\modules\twitch_events.js
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/eventsub/chat/status"
$c.eventSubChat | Select-Object enabled,autostart,autostartEvaluated,active,connecting,lastAutostartResult,lastError
```

## Danach

```text
BUS-TWITCH.11 – Stabilitaet/Monitoring fuer EventSub Chat pruefen:
- Restart-Route testen
- Reconnect/Keepalive beobachten
- EventSub Chat + Commands nach Backend-Neustart testen
- Danach erst weitere Module schrittweise abonnieren
```
