# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestaetigter Zusatzstand

```text
STEP BUS-TWITCH.4 – EventSub Chat Readiness
```

## Twitch Events / Communication Bus

Bestaetigt:

```text
- twitch_events 0.1.3 / BUS_TWITCH_4_EVENTSUB_CHAT_READINESS
- BUS-TWITCH.1 Foundation bestaetigt
- BUS-TWITCH.2 Chat Parallel Bridge live bestaetigt
- twitch.chat.message wurde ueber twitch_presence/IRC -> twitch_events -> Bus erfolgreich gezaehlt
- BUS-TWITCH.3 EventSub-Ownership vorbereitet
- BUS-TWITCH.4 channel.chat.message Readiness dokumentiert und Statusroute ergaenzt
```

EventSub Ownership aktuell:

```text
currentOwner: twitch.js
desiredOwner: twitch_events
mode: prepared-disabled
takeoverEnabled: false
websocketEnabled: false
subscriptionCreationEnabled: false
existingTwitchJsEventSubKept: true
existingFlowsChanged: false
```

EventSub Chat Readiness:

```text
subscription: channel.chat.message v1
active: false
subscriptionCreationEnabled: false
currentLiveChatSource: twitch_presence/irc parallel bridge
targetLiveChatSource: twitch_events EventSub channel.chat.message
```

## Wichtige Abgrenzung

```text
Keine EventSub-Logik aus twitch.js entfernt.
Keine EventSub-Subscription erstellt.
Keine Alert-/VIP-/Loyalty-/Deathcounter-/Shoutout-Flows umgebaut.
Keine Command-Direktlogik entfernt.
Keine SQLite-Datei ersetzt oder geaendert.
```
