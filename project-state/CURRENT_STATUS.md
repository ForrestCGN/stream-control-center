# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestaetigter Zusatzstand

```text
STEP BUS-TWITCH.3 – EventSub Ownership Preparation
```

## Twitch Events / Communication Bus

Bestaetigt:

```text
- twitch_events 0.1.2 / BUS_TWITCH_3_EVENTSUB_OWNERSHIP_PREP
- BUS-TWITCH.1 Foundation bestaetigt
- BUS-TWITCH.2 Chat Parallel Bridge live bestaetigt
- twitch.chat.message wurde ueber twitch_presence/IRC -> twitch_events -> Bus erfolgreich gezaehlt
- BUS-TWITCH.3 bereitet EventSub-Ownership in twitch_events vor
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

## Wichtige Abgrenzung

```text
Keine EventSub-Logik aus twitch.js entfernt.
Keine Alert-/VIP-/Loyalty-/Deathcounter-/Shoutout-Flows umgebaut.
Keine Command-Direktlogik entfernt.
Keine SQLite-Datei ersetzt oder geaendert.
```
