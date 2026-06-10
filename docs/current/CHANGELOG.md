# CHANGELOG – stream-control-center

## 2026-06-09 – AUTOSHOUT-HOTFIX.1

### Geändert

```text
backend/modules/clip_shoutout.js
```

### Behoben

```text
autoRawMessage is not defined
```

### Ergebnis

```text
AutoShout verarbeitet Chataktivität wieder.
2-Nachrichten-Regel funktioniert.
!lurk funktioniert als erste Nachricht.
lastError bleibt leer.
```

### Nicht geändert

```text
Keine Queue-Logik.
Keine OfficialQueue-Logik.
Keine Twitch-Presence-Logik.
Keine Streamer.bot-Logik.
Keine DB-Datei ersetzt.
```

## 2026-06-10 – BUS-TWITCH.2

### Geändert

```text
backend/modules/twitch_events.js
backend/modules/twitch_presence.js
```

### Neu

```text
PRIVMSG aus twitch_presence wird zusaetzlich ueber twitch_events als twitch.chat.message emittiert.
```

### Nicht geändert

```text
commands.handleChatMessage(...) bleibt aktiv.
twitch.js EventSub-Direktlogik bleibt aktiv.
Keine Alerts/VIP30/Loyalty/Sound-Umstellung.
Keine SQLite-Aenderung.
Keine Altlogik entfernt.
```
