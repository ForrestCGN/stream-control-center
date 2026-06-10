# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.15

### Geändert

```text
backend/modules/vip30.js
```

### Neu

```text
VIP30 Subscriber auf twitch.channelpoints.redemption.created
Routen: /api/vip30/channelpoints/twitch-events/status|start|stop
```

### Nicht geändert

```text
Kein Entfernen des alten Channelpoints-/VIP30-Wegs.
Keine Änderung an Fulfill/Cancel/VIP-Grant.
Keine DB-Datei ersetzt.
```


## BUS-TWITCH.15b

- Fix: VIP30 TwitchEvents Subscriber normalisiert `twitch_events` Bus-Payload aus `payload.twitch`.
- Diagnose: Status enthaelt `lastNormalized`.
- Keine Aenderung an Fulfill/Cancel, DB oder altem Bridge-Weg.
