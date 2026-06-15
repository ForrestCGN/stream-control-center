# Modulnotiz – Twitch Events, Loyalty Core und Alert Shadow

Stand: 2026-06-15

## Zielbild

`twitch_events` ist die zentrale Quelle für abonnierbare Twitch-Events.

Aktueller bestätigter Pfad:

```text
Twitch EventSub
→ twitch.js
→ twitch_events
→ Communication Bus
→ Consumer
```

Aktive Consumer:

```text
loyalty      produktiv
alert_system shadow/diagnose
```

## Unterstützte EventKeys

```text
twitch.follow.received
twitch.sub.received
twitch.resub.received
twitch.subgift.received
twitch.giftbomb.received
twitch.cheer.received
twitch.raid.received
```

## Loyalty Core

Loyalty verarbeitet die Events produktiv über gezielte Bus-Subscriptions.

Status:

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status"
$loy.twitchEventBonusBinding
```

Wichtige erwartete Felder:

```text
installed
subscriptionCount
received
processed
skipped
duplicates
errors
lastEventKey
lastLogin
```

Alter Loyalty-Direktpfad ist standardmäßig deaktiviert.

Fallback:

```text
TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true
```

## Alert-System

Alert-System subscribed im Shadow-Modus auf Twitch-Events.

Status:

```powershell
$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch-events/status"
$a
```

Wichtige Felder:

```text
requestedMode
effectiveMode
productiveEnqueue
received
mapped
wouldEnqueue
enqueued
blocked
skipped
errors
lastEventKey
lastLogin
lastTypeKey
```

Aktuell gilt:

```text
effectiveMode = shadow
productiveEnqueue = false
enqueued = 0
```

Produktivmodus ist vorbereitet, aber nicht aktiviert.

Spätere Env-Freigabe:

```text
ALERT_TWITCH_EVENTS_ALERT_MODE=bus
ALERT_TWITCH_EVENTS_ALERT_ALLOW_BUS=true
```

Nicht setzen, bevor der alte Alert-Direktpfad diagnostisch sichtbar/deaktivierbar ist und Shadow über mehrere Streams stabil war.

## Monitoring über mehrere Streams

Mindestens beobachten:

```text
follow
raid
sub
resub
subgift
giftbomb
cheer/bits
```

Erwartung im Shadow:

```text
received +1
mapped +1
wouldEnqueue +1
enqueued 0
skipped 0
errors 0
```

## Nächster Alert-Schritt später

```text
ALERT-TWITCH-1C
```

Ziel:

```text
alten Alert-Direktforward in twitch.js diagnostisch sichtbar und schaltbar machen.
```

Erst danach Bus-Alert-Produktivmodus testen.
