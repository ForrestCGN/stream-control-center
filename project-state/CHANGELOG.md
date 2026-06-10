# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.9

### Geändert

```text
backend/modules/commands.js
backend/modules/twitch_presence.js
```

### Ergebnis

```text
commands Bus-Chat-Subscriber startet standardmäßig automatisch.
twitch_presence Command-Direktweg ist standardmäßig deaktiviert, bleibt aber per Route aktivierbar.
Damit wird EventSub/Bus zur primären Command-Quelle nach Neustart.
```

### Nicht geändert

```text
Keine Command-Funktionalität entfernt.
Keine EventSub-Alt-Flows aus twitch.js entfernt.
Keine DB-Datei ersetzt.
```
