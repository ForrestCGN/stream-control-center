# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestätigter/gelieferter Stand

```text
STEP BUS-TWITCH.9 – Command Source Defaults gebaut
```

## Twitch Events / Command Source

```text
- twitch_events EventSub channel.chat.message läuft als Zielquelle.
- commands nutzt den Communication Bus nun als Default-Command-Quelle.
- COMMANDS_BUS_CHAT_SUBSCRIBER_AUTOSTART default: true.
- twitch_presence Command-Direktweg bleibt vorhanden, aber default: false.
- Direktweg kann bei Bedarf per Route wieder aktiviert werden.
- Keine Command-Funktionalität entfernt.
```

## Nicht geändert

```text
Keine SQLite-/DB-Datei ersetzt.
Keine bestehenden Commands entfernt.
Keine Twitch EventSub Alt-Flows in twitch.js entfernt.
Keine Presence-/IRC-Funktion gelöscht.
```
