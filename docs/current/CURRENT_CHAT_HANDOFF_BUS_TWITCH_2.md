# CURRENT CHAT HANDOFF – BUS-TWITCH.2

Stand: 2026-06-10

## Abgeschlossener Step

```text
STEP BUS-TWITCH.2 – Chat Parallel Bridge ueber twitch_events
```

## Ergebnis

```text
backend/modules/twitch_events.js Version 0.1.1 / BUS_TWITCH_2_CHAT_PARALLEL
backend/modules/twitch_presence.js Version 0.1.1 / BUS_TWITCH_2_CHAT_PARALLEL
```

`twitch_presence` sendet bei PRIVMSG zusaetzlich ein leichtes Chat-Event an `twitch_events`.
Der bestehende Command-Direktaufruf bleibt aktiv.

## Event

```text
channel: twitch.chat
action: message
eventKey: twitch.chat.message
requireAck: false
replayable: false
ttlMs: 0
queued: false
priority: P2
payload: minimal
```

## Nicht geaendert

```text
twitch.js
commands.js
alerts
vip30
loyalty
sound_system
overlays
SQLite
produktive Altweiterleitungen
```

## Naechster sinnvoller Schritt

```text
BUS-TWITCH.3 – Ersten Subscriber gezielt anbinden, z. B. Diagnose/Testsubscriber oder Loyalty Claim Subscriber.
```

Erst nach erfolgreichem Subscriber-Test wird irgendwo alte Direktlogik entfernt.
