# Twitch Events → Loyalty Bonus Events

Stand: 2026-06-15
Projekt: `stream-control-center`

## Zweck

Diese Doku beschreibt den aktuellen bestätigten Pfad für Twitch-Support-Events, die Loyalty-Punkte auslösen.

## Produktiver Pfad

```text
Twitch EventSub Notification
→ backend/modules/twitch.js
→ twitch_events.handleEventSubNotification(...)
→ backend/modules/twitch_events.js
→ Communication Bus
→ backend/modules/loyalty.js
→ recordEventBonus(...)
→ Loyalty Event + Transaktion
```

## Unterstützte Eventtypen

```text
channel.follow                → twitch.follow.received
channel.subscribe             → twitch.sub.received
channel.subscription.message  → twitch.resub.received
channel.subscription.gift     → twitch.subgift.received
channel.cheer                 → twitch.cheer.received
channel.raid                  → twitch.raid.received
```

Hinweis:

```text
GiftBomb wird über das vorhandene Mapping/Handling in twitch_events/loyalty berücksichtigt, soweit dort EventSub-Daten entsprechend erkannt werden.
```

## Loyalty-Subscriptions

`loyalty.js` nutzt seit Version 0.1.17 gezielte Subscriptions:

```text
twitch.follow   / received
twitch.sub      / received
twitch.resub    / received
twitch.subgift  / received
twitch.giftbomb / received
twitch.cheer    / received
twitch.raid     / received
```

Dadurch werden rohe EventSub-Events wie `twitch.eventsub.notification.received` nicht mehr als Loyalty-Skips gezählt.

## Legacy-Direktforward

Der alte direkte Pfad:

```text
EventSub → normalizeTwitchEventSubToLoyaltyEvent(...) → /api/loyalty/events/bonus
```

ist seit `twitch.js` Version 0.1.9 standardmäßig deaktiviert.

Fallback:

```text
TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true
```

Nur im Notfall verwenden, wenn der neue Bus-Weg ausfällt.

## Statusrouten

### Loyalty

```text
GET /api/loyalty/status
```

Wichtiger Block:

```text
twitchEventBonusBinding
```

### Twitch EventSub

```text
GET /api/twitch/eventsub/status
```

Wichtige Blöcke:

```text
twitchEventsParallel.supportEvents
legacyLoyaltyDirectForward
```

### Twitch Events

```text
GET /api/twitch/events/status
```

Wichtige Blöcke:

```text
diagnostics.counts
diagnostics.runtime.lastEvent
```

## Minimaltest

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status"
$loy.twitchEventBonusBinding | Select-Object received,processed,skipped,duplicates,errors,lastEventKey,lastLogin,lastError

$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status"
$t.twitchEventsParallel.supportEvents | Select-Object enabled,forwarded,failed,lastEventSubType,lastUserLogin,lastError
$t.legacyLoyaltyDirectForward | Select-Object enabled,forwarded,skipped,failed,lastEventSubType,lastUserLogin,lastError
```

Erwartung nach echtem Event:

```text
supportEvents.forwarded steigt
loyalty.received steigt
loyalty.processed steigt
loyalty.skipped bleibt 0
legacyLoyaltyDirectForward.forwarded bleibt 0
errors/failed bleiben 0
```
