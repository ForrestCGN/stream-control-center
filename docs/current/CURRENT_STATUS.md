# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller Stand

```text
STEP BUS-TWITCH.14b – Channelpoints Parallel Tap Reliability gebaut
```

## Twitch Events / Bus

Bestätigt:

```text
- EventSub Chat läuft über twitch_events als Autostart.
- Commands laufen standardmäßig über communication_bus.
- Presence-Direktweg ist default aus, bleibt als Fallback vorhanden.
- Channelpoints werden parallel als twitch.channelpoints.redemption.created vorbereitet.
```

## BUS-TWITCH.14b

Geändert:

```text
backend/modules/twitch.js
```

Ziel:

```text
Jede channel.channel_points_custom_reward_redemption.add Redemption zuverlässig an twitch_events forwarden.
```

Nicht geändert:

```text
Keine VIP30-Verarbeitung entfernt.
Kein Fulfill/Cancel geändert.
Keine DB-Datei ersetzt.
```
