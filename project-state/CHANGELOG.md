# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.10

### Geaendert

```text
backend/modules/twitch_events.js
```

### Neu

```text
EventSub Chat Autostart default true
/api/twitch/events/eventsub/chat/restart
Statusfelder autostart/autostartEvaluated/lastAutostartResult
```

### Nicht geaendert

```text
Keine alten Flows entfernt.
twitch.js bleibt fuer bestehende EventSub-Flows aktiv.
twitch_presence bleibt Fallback.
```
