# NEXT STEPS – stream-control-center

Stand: 2026-06-10

## Direkt

```text
BUS-TWITCH.6 live testen: Startroute ausfuehren, Chatnachricht senden, Counter pruefen.
```

## Danach

```text
BUS-TWITCH.7 – Commands als Subscriber vorbereiten, Direkt-Hook weiter behalten.
```


## STEP BUS-TWITCH.7 – Commands Subscriber vorbereitet

```text
commands kann twitch.chat.message ueber den Communication Bus abonnieren.
Der bestehende twitch_presence -> commands.handleChatMessage Direktaufruf bleibt aktiv.
Subscriber ist per Runtime-Route start/stop steuerbar; Autostart nur per COMMANDS_BUS_CHAT_SUBSCRIBER_AUTOSTART=true.
Keine bestehende Funktionalitaet entfernt.
```
