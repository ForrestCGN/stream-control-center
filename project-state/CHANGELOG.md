# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.6

### Geaendert

```text
backend/modules/twitch_events.js
backend/modules/twitch.js
```

### Neu

```text
EventSub Chat Start/Stop/Status fuer channel.chat.message.
Duplikat-Schutz fuer IRC/EventSub parallel.
User-Access-Token-Helper aus twitch.js exportiert.
```

### Nicht geaendert

```text
Keine bestehenden EventSub-Flows entfernt.
Keine Commands umgestellt.
Keine SQLite-Datei ersetzt.
```


## STEP BUS-TWITCH.7 – Commands Subscriber vorbereitet

```text
commands kann twitch.chat.message ueber den Communication Bus abonnieren.
Der bestehende twitch_presence -> commands.handleChatMessage Direktaufruf bleibt aktiv.
Subscriber ist per Runtime-Route start/stop steuerbar; Autostart nur per COMMANDS_BUS_CHAT_SUBSCRIBER_AUTOSTART=true.
Keine bestehende Funktionalitaet entfernt.
```
