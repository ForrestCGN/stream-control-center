# Module-Dokumentation

Stand: 2026-06-10

## Aktueller Zusatzstand

```text
STEP BUS-TWITCH.4 – EventSub Chat Readiness
```

## Twitch Events

```text
twitch_events 0.1.3 / BUS_TWITCH_4_EVENTSUB_CHAT_READINESS
```

Bestaetigt:

```text
BUS-TWITCH.1 Foundation laeuft.
BUS-TWITCH.2 Chat Parallel Bridge ueber twitch_presence/IRC laeuft.
BUS-TWITCH.3 EventSub Ownership ist vorbereitet, aber nicht aktiv.
BUS-TWITCH.4 dokumentiert channel.chat.message Readiness und pruefbare Statusroute.
```

Statusrouten:

```text
/api/twitch/events/status
/api/twitch/events/catalog
/api/twitch/events/eventsub/ownership
/api/twitch/events/eventsub/chat-readiness
```

## Wichtige Projektregeln

```text
Keine Funktionalitaet entfernen.
ACK/Replay fuer Twitch-Events vorbereitet, aber default aus.
Chat bleibt High-Frequency-Light-Event: kein ACK, kein Replay, ttlMs 0.
twitch.js bleibt aktuell produktiver EventSub-Besitzer.
twitch_events wird schrittweise vorbereitet und spaeter kontrolliert aktiviert.
Alte Direktlogik erst nach erfolgreichem Subscriber-Test entfernen/deaktivieren.
```
