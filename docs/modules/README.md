# Module-Dokumentation

Stand: 2026-06-10

## Aktueller BUS-TWITCH-Stand

```text
BUS-TWITCH.12 – Modul-Migrationsplan für Twitch-Events erstellt
```

## Produktiver Standardweg Chat/Commands

```text
Twitch EventSub channel.chat.message
→ twitch_events
→ communication_bus
→ commands
```

## Relevante Moduldokus

```text
docs/modules/twitch_events.md
docs/modules/commands.md
docs/modules/twitch_presence.md
```

## Nächste Migrationskandidaten

```text
1. Channelpoints / VIP30
2. Alerts / Subs / Bits / Raids / Follows
3. Loyalty / Glücksrad / Giveaways
4. Shoutout / ClipShoutout
5. Deathcounter / Streamstatus / Game Sync
```

## Wichtige Projektregeln

```text
Keine Funktionalität entfernen.
Erst parallel abonnieren und testen.
StepDone vor Live-Test.
Twitch-Events bleiben leichtgewichtig.
```
