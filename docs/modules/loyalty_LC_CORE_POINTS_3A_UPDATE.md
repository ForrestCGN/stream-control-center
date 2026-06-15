# Module Update – loyalty – LC-CORE-POINTS-3A

Stand: 2026-06-15

## Änderung

`loyalty` konsumiert ab Version 0.1.16 Twitch-Events aus `twitch_events` über den Communication Bus.

## Neuer Statusblock

```text
twitchEventBonusBinding
```

## Subscription

```text
id: loyalty:twitch.events:bonus_events
sourceModule: twitch_events
action: received
```

## Konsumierte Events

```text
twitch.follow.received
twitch.sub.received
twitch.resub.received
twitch.subgift.received
twitch.giftbomb.received
twitch.cheer.received
twitch.raid.received
```

## Verarbeitung

Die Events werden normalisiert und an `recordEventBonus()` übergeben.

## Diagnosefelder

```text
installed
subscriptionId
subscribedAction
consumedEvents
lastEventAt
lastEventKey
lastLogin
lastResult
received
processed
skipped
duplicates
errors
lastError
```
