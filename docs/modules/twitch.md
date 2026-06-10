# Modul: twitch

Stand: BUS-TWITCH.14b

## Version

```text
0.1.5 / BUS_TWITCH_14B_CHANNELPOINTS_PARALLEL_RELIABILITY
```

## Channelpoints Parallel Tap

`twitch.js` leitet `channel.channel_points_custom_reward_redemption.add` zusätzlich an `twitch_events` weiter.

Quellen:

```text
notification
cache
audit
```

Dedupe erfolgt über Redemption-ID.
