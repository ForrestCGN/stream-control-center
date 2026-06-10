# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestaetigter Bereich

```text
BUS-TWITCH.10 – EventSub Chat Autostart / Restart-Sicherheit vorbereitet
```

## BUS-TWITCH Stand

```text
BUS-TWITCH.1  Foundation
BUS-TWITCH.2  Presence/IRC Parallelbridge
BUS-TWITCH.3  EventSub Ownership vorbereitet
BUS-TWITCH.4  Chat Readiness
BUS-TWITCH.5  Live Token/ID Readiness
BUS-TWITCH.5b OAuth Force Verify
BUS-TWITCH.6  EventSub Chat aktiv
BUS-TWITCH.7  Commands Subscriber
BUS-TWITCH.8/8b Source Switch + Route Fix
BUS-TWITCH.9  Command Source Defaults
BUS-TWITCH.10 EventSub Chat Autostart / Restart-Sicherheit
```

## Aktueller Zielweg

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

## Abgrenzung

```text
Keine alte Funktionalitaet entfernt.
twitch.js EventSub-Flows bleiben aktiv.
twitch_presence bleibt als Fallback vorhanden.
```
