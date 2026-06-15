# Module Update – twitch_events – LC-CORE-POINTS-3A

Stand: 2026-06-15

## Status

`twitch_events` wurde in diesem Schritt nicht geändert.

## Rolle

`twitch_events` bleibt zentrale Quelle für Twitch EventSub-/Twitch-Ereignisse und stellt vorhandene Bus-Events bereit, die von anderen Modulen abonniert werden können.

## Von Loyalty konsumierte Eventnamen

```text
twitch.follow.received
twitch.sub.received
twitch.resub.received
twitch.subgift.received
twitch.giftbomb.received
twitch.cheer.received
twitch.raid.received
```

## Entscheidung

Es wurden keine zusätzlichen Kurz-Eventnamen wie `twitch.follow` oder `twitch.subscribe` parallel eingeführt. Stattdessen werden die vorhandenen `.received`-Events genutzt, um Doppelstrukturen zu vermeiden.

## Später

Das Alert-System soll später ebenfalls als Consumer an diese Eventquelle angebunden werden, aber nicht in LC-CORE-POINTS-3A.
