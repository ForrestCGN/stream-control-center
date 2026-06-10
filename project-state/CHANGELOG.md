# CHANGELOG – stream-control-center

## 2026-06-10 – BUS-TWITCH.14

### Geändert

```text
backend/modules/twitch.js
backend/modules/twitch_events.js
```

### Neu

```text
channel.channel_points_custom_reward_redemption.add wird parallel an twitch_events weitergegeben.
twitch_events emittiert daraus twitch.channelpoints.redemption.created.
Statusroute: /api/twitch/eventsub/channelpoints-parallel/status
```

### Nicht geändert

```text
VIP30 bleibt auf altem produktivem Weg.
Channelpoints bleibt auf altem produktivem Weg.
Fulfill/Cancel bleibt unverändert.
Keine DB-Änderungen.
```
