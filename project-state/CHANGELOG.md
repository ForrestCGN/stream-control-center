# CHANGELOG – stream-control-center

Stand: 2026-06-11

## 2026-06-11 – STEP214 / LWG-5.6 Command Result Chat Send Bridge

### Geändert

```text
backend/modules/commands.js (per Apply-Script)
```

### Ergebnis

```text
commands.js kann Modul-Result-Nachrichten zentral in den Twitch-Chat senden.
Dazu wird das vorhandene twitch_presence.sendChatMessage(...) genutzt.
Die Ausgabe ist config-gesteuert, damit bestehende Commands nicht doppelt senden.
```

### Für !punkte

```text
!punkte / !points bekommt config.sendResultToChat=true.
```

### Keine Änderung

```text
Keine neue Twitch-Sender-Implementierung.
Keine Datenbank-Ersetzung.
Keine Secret-Dateien.
Keine Gamble-Aktivierung.
```
