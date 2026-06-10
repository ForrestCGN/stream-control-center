# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestätigter BUS-TWITCH-Stand

```text
STEP BUS-TWITCH.14 – Channelpoints Redemption Created Parallel Emit vorbereitet
```

## Twitch Events / Bus

Bestätigt vor diesem Step:

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

Neu in BUS-TWITCH.14:

```text
twitch.js behält die bestehende Channelpoints-EventSub-Verarbeitung.
twitch.js gibt channel.channel_points_custom_reward_redemption.add zusätzlich an twitch_events weiter.
twitch_events normalisiert daraus twitch.channelpoints.redemption.created.
Bestehende VIP30-/Channelpoints-Flows bleiben unverändert aktiv.
```

## Versionen

```text
twitch.js      0.1.4 / BUS_TWITCH_14_CHANNELPOINTS_PARALLEL_EMIT
twitch_events  0.1.7 / BUS_TWITCH_14_CHANNELPOINTS_PARALLEL_EMIT
```

## Nicht geändert

```text
Keine VIP30-Logik entfernt.
Keine Channelpoints-Logik entfernt.
Kein Fulfill/Cancel umgebaut.
Keine SQLite-/DB-Datei ersetzt.
```
