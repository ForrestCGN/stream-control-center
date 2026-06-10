# CHANGELOG – stream-control-center

Stand: 2026-06-10

## 2026-06-10 – BUS-TWITCH.17 Dokumentation / Bus-Konsolidierung

### Geändert

```text
docs/current/*
docs/modules/communication_bus.md
docs/modules/twitch_events.md
docs/modules/vip30.md
project-state/*
```

### Ergebnis

```text
VIP30-Migration auf den Communication-Bus dokumentiert.
Bus-Architektur und Twitch-Event-Status dokumentiert.
Next Steps für nächste Modul-Migration vorbereitet.
```

### Nicht geändert

```text
Keine Code-Dateien.
Keine Datenbankdateien.
Keine Runtime-Konfiguration.
```

## 2026-06-10 – BUS-TWITCH.16c

### Geändert

```text
backend/modules/vip30.js
```

### Ergebnis

```text
VIP30 TwitchEvents Subscriber bleibt Autostart-Standard.
VIP30 Legacy Bridge Default-Autostart ist aus.
Legacy bleibt als manueller Fallback start-/stoppbar.
```

## 2026-06-10 – BUS-TWITCH.16b

### Ergebnis

```text
Legacy Bridge Hard Disable Gate bestätigt.
Wenn Legacy gestoppt ist, verarbeitet der alte Weg keine VIP30-Decisions mehr.
```

## 2026-06-10 – BUS-TWITCH.15b

### Ergebnis

```text
VIP30 Payload Mapping für payload.twitch.* korrigiert.
Reward 30 Tage VIP wird über Bus korrekt erkannt.
```

## 2026-06-10 – BUS-TWITCH.14b

### Ergebnis

```text
Channelpoints Parallel Tap zuverlässiger gemacht.
notification/cache/audit Quellen werden dedupliziert.
```
