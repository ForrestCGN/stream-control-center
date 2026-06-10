# Modul: vip30

Stand: 2026-06-10

## BUS-TWITCH.15

VIP30 kann `twitch.channelpoints.redemption.created` abonnieren.

## Routen

```text
GET/POST /api/vip30/channelpoints/twitch-events/start
GET/POST /api/vip30/channelpoints/twitch-events/stop
GET      /api/vip30/channelpoints/twitch-events/status
```

## Sicherheits-/Migrationsregel

Der alte produktive Channelpoints-Bridge-Weg bleibt aktiv, bis der neue Subscriber live bestätigt wurde.


## BUS-TWITCH.15b

Der TwitchEvents-Subscriber fuer Channelpoints liest das von `twitch_events` publizierte Bus-Event `twitch.channelpoints.redemption.created`. Die fachlichen Twitch-Daten liegen im Bus-Payload unter `payload.twitch`; deshalb normalisiert VIP30 jetzt sowohl direkte Payloads als auch `payload.twitch`-Payloads. `lastNormalized` im Status dient als Live-Diagnose.
