# Loyalty Wheel / CGN Glücksrad

Stand: 2026-06-08  
STEP: LWG-4F.2

## Overlay Heartbeat

Das Wheel-Overlay sendet jetzt ueber den vorhandenen WebSocket nach `hello` alle 5 Sekunden einen `heartbeat`.

Datei:

```text
htdocs/overlays/loyalty/wheel_overlay.html
```

Ziel:

```text
overlay_monitor soll das Overlay nicht mehr als angemeldet ohne echten Heartbeat melden.
```
