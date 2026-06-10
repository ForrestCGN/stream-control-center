# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestätigter Hauptstand

```text
STEP BUS-TWITCH.12 – Modul-Migrationsplan für Twitch-Events
```

## Bestätigter produktiver Standardweg für Chat/Commands

```text
Twitch EventSub channel.chat.message
→ backend/modules/twitch_events.js
→ communication_bus
→ backend/modules/commands.js
```

## Aktive/Bestätigte Modulstände

```text
twitch_events   0.1.6 / BUS_TWITCH_10_EVENTSUB_CHAT_AUTOSTART
commands        0.2.1 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
twitch_presence 0.1.4 / BUS_TWITCH_9_COMMAND_SOURCE_DEFAULTS
twitch.js       0.1.3 / BUS_TWITCH_6_EVENTSUB_CHAT_ENABLE
```

## Neu mit BUS-TWITCH.12

```text
Modul-Migrationsplan für weitere Twitch-Events erstellt.
Priorität 1: Channelpoints/VIP30.
Priorität 2: Alerts/Subs/Bits/Raids/Follows.
Priorität 3: Loyalty/Giveaways.
Priorität 4: Shoutout/ClipShoutout.
Priorität 5: Deathcounter/Streamstatus/Game Sync.
```

## Wichtige Regeln für weitere Migration

```text
Keine Funktionalität entfernen.
Erst parallel abonnieren und testen.
Erst danach alte Direktlogik deaktivieren oder entfernen.
StepDone vor Live-Test.
Twitch-Events bleiben leichtgewichtig: kein ACK, kein Replay, keine Queue als Standard.
ACK/Replay sind vorbereitet, aber default aus.
Koordinierte Systemaktionen sollen später eigene Lifecycle-/Result-Events nutzen.
```
