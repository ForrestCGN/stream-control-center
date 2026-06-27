# CURRENT CHAT HANDOFF – BUS-TWITCH.3

Stand: 2026-06-10

## Aktueller Stand

```text
BUS-TWITCH.3 – EventSub Ownership Preparation abgeschlossen.
```

## Wichtig

`twitch_events` ist als zukuenftige zentrale Twitch-Event-Schicht vorbereitet. Aktuell bleibt `twitch.js` aber produktiver EventSub-Besitzer.

```text
currentOwner: twitch.js
desiredOwner: twitch_events
mode: prepared-disabled
```

## Bisher getestet

```text
BUS-TWITCH.1: Status, Katalog, Bus-Registrierung, Heartbeat ok.
BUS-TWITCH.2: twitch_presence/IRC -> twitch_events -> Bus twitch.chat.message live ok.
```

## Naechster Schritt

```text
BUS-TWITCH.4 – EventSub Chat Subscription in twitch_events
```

Vorher pruefen:

```text
- Token/Scopes fuer channel.chat.message
- user_id/Bot-User fuer Chat-Subscription
- Duplikat-Schutz IRC + EventSub
- keine Altlogik entfernen
```
