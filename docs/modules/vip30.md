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
