# CURRENT CHAT HANDOFF – Loyalty Wheel Overlay LWG-4F.2

Stand: 2026-06-08

## Neuer Stand

```text
STEP LWG-4F.2 – Wheel Overlay Heartbeat
```

## Geaendert

```text
htdocs/overlays/loyalty/wheel_overlay.html
```

## Verhalten

Das Overlay sendet jetzt:

```text
hello
heartbeat alle 5 Sekunden
```

ueber den bereits vorhandenen WebSocket/Communication-Bus.

## Ziel

Die Overlay-Monitor-Warnung zu `loyalty_wheel_overlay` soll verschwinden.
