# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.14b

### Geändert

```text
backend/modules/twitch.js
```

### Änderung

```text
Channelpoints Parallel Tap für twitch_events zuverlässiger gemacht.
Zusätzliche Fallback-Quellen: cache + audit.
Redemption-ID-Dedupe ergänzt.
```

### Nicht geändert

```text
Keine VIP30-/Channelpoints-Altlogik entfernt.
Keine DB-Datei geändert.
Kein Fulfill/Cancel geändert.
```
