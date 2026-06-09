# CURRENT CHAT HANDOFF – Loyalty LWG-4O.0b

Stand: 2026-06-09

## Aktueller Fokus

Loyalty / Giveaways / optionale Gewinner-Meldepflicht per Chat.

## Bestätigte Architektur

`twitch_presence` bleibt die Chatquelle. Das Modul empfängt Twitch IRC `PRIVMSG`, speichert Presence/Aktivität und ruft aktuell `commands.handleChatMessage(...)` direkt auf.

Künftiger Zielzustand:

```text
twitch_presence empfängt PRIVMSG
→ zusätzlich leichtes Bus-Event twitch.chat.message
→ Commands bleiben zunächst direkt angebunden
→ Giveaways reagieren später über Bus-Subscriber
```

## Lastschutz

Normale Chat-Events:

```text
replayable: false
requireAck: false
ttlMs: 0
kein Payload-Audit
kein Broadcast an alle UI-/Overlay-Clients
Payload minimal
```

## Noch nicht umgesetzt

- Keine Codeänderung an `twitch_presence.js` in LWG-4O.0b.
- Keine Giveaway-Claim-Logik.
- Keine Priority-Queue.

## Nächster Code-Step

```text
LWG-4O.1 – Twitch Presence Chat-Bus-Bridge Code
```

Dabei echte aktuelle Datei prüfen und nur minimal ergänzen.
