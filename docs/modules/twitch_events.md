# Modul: twitch_events

Stand: 2026-06-10

## Version

```text
0.1.7 / BUS_TWITCH_14_CHANNELPOINTS_PARALLEL_EMIT
```

## Neue Aufgabe in BUS-TWITCH.14

`twitch_events` normalisiert `channel.channel_points_custom_reward_redemption.add` zu:

```text
twitch.channelpoints.redemption.created
channel: twitch.channelpoints.redemption
action: created
```

## Policy

```text
requireAck=false
replayable=false
ttlMs=0
queued=false
priority=P1
```

## Quelle in diesem Step

```text
twitch.js ruft twitch_events.handleEventSubNotification(...) parallel auf.
```

Der Altweg bleibt unverändert aktiv.
