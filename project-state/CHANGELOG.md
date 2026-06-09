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
