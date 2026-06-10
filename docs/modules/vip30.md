# vip30

BUS-TWITCH.16: VIP30 kann Channelpoints über `twitch.channelpoints.redemption.created` aus dem zentralen TwitchEvents-Bus verarbeiten. Der alte `channelpoints.redemption/received`-Bridge-Weg bleibt vorhanden und ist per Runtime-Routen start-/stoppbar.

Routen:
- `/api/vip30/channelpoints/source/status`
- `/api/vip30/channelpoints/bridge/start`
- `/api/vip30/channelpoints/bridge/stop`
- `/api/vip30/channelpoints/twitch-events/status`
