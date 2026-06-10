# TODO – stream-control-center

Stand: 2026-06-10

- [x] BUS-TWITCH.1 Foundation
- [x] BUS-TWITCH.2 IRC Chat Parallel Bridge
- [x] BUS-TWITCH.3 EventSub Ownership Preparation
- [x] BUS-TWITCH.4 EventSub Chat Readiness
- [x] BUS-TWITCH.5 Live Token/ID Readiness
- [x] BUS-TWITCH.5b OAuth Force Verify Diagnostics
- [ ] BUS-TWITCH.6 Live-Test EventSub Chat Enable
- [ ] BUS-TWITCH.7 Commands Subscriber vorbereiten


## STEP BUS-TWITCH.7 – Commands Subscriber vorbereitet

```text
commands kann twitch.chat.message ueber den Communication Bus abonnieren.
Der bestehende twitch_presence -> commands.handleChatMessage Direktaufruf bleibt aktiv.
Subscriber ist per Runtime-Route start/stop steuerbar; Autostart nur per COMMANDS_BUS_CHAT_SUBSCRIBER_AUTOSTART=true.
Keine bestehende Funktionalitaet entfernt.
```
