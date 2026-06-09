# NEXT STEPS – LWG-4O.1b

## Nächster Code-Step

LWG-4O.1c – Chat-Event direkt in twitch_presence integrieren

## Vorbereitung

Vom echten aktuellen System prüfen oder hochladen:

- `backend/modules/twitch_presence.js`
- optional: `backend/modules/commands.js`

## Umsetzungsidee

1. `twitch_presence` bleibt Chatquelle.
2. Bei `PRIVMSG` zusätzlich ein leichtes Bus-Event erzeugen:

```text
channel: twitch.chat
action: message
meta.replayable: false
meta.requireAck: false
meta.ttlMs: 0
meta.priority: P2
```

3. Bestehenden Command-Direktaufruf zunächst behalten.
4. Statuswerte/Zähler direkt in Twitch-Presence anzeigen.
5. Nach erfolgreichem Test `twitch_chat_bus_bridge.js` entfernen.

## Später

- Commands optional als Subscriber umstellen.
- Giveaway Claim Subscriber ergänzen.
- Bus-Prio-/Backpressure-System separat planen.
