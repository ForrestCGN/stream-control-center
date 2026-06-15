# Twitch Events → Loyalty Bonus Events

Stand: 2026-06-15
Status: LC-CORE-POINTS-3E live bestätigt

## Ziel

`twitch_events` ist die zentrale Quelle für abonnierbare Twitch-Events. `loyalty` verarbeitet Twitch-Bonus-Events nicht mehr über den direkten Legacy-Pfad, sondern über gezielte Subscriptions am Communication Bus.

## Bestätigte Verarbeitungskette

```text
Twitch EventSub
→ backend/modules/twitch.js
→ twitch_events.handleEventSubNotification(...)
→ backend/modules/twitch_events.js
→ Communication Bus
→ backend/modules/loyalty.js
→ recordEventBonus(...)
→ Loyalty-Event + Transaktion
```

## Beteiligte Dateien

```text
backend/modules/twitch.js
backend/modules/twitch_events.js
backend/modules/communication_bus.js
backend/modules/loyalty.js
backend/modules/helpers/helper_communication.js
```

## Versionen

```text
backend/modules/loyalty.js  0.1.17
backend/modules/twitch.js   0.1.10
```

## Unterstützte Bonus-Events

```text
twitch.follow.received   → follow
twitch.sub.received      → subscribe
twitch.resub.received    → resub
twitch.subgift.received  → gift_sub
twitch.giftbomb.received → gift_bomb
twitch.cheer.received    → cheer
twitch.raid.received     → raid
```

## Loyalty-Subscriptions

`loyalty` nutzt 7 gezielte Bus-Subscriptions:

```text
twitch.follow   / received
twitch.sub      / received
twitch.resub    / received
twitch.subgift  / received
twitch.giftbomb / received
twitch.cheer    / received
twitch.raid     / received
```

Dadurch werden rohe/systemnahe Events wie `twitch.eventsub.notification.received` nicht mehr als Loyalty-Bonus-Event gesehen und erzeugen keine unnötigen `skipped`-Zähler mehr.

## Legacy-Direktforward

Der alte direkte Forward von EventSub zu Loyalty ist im Code noch vorhanden, aber standardmäßig deaktiviert.

Standard:

```text
TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD nicht gesetzt
→ disabled
```

Notfall-Fallback:

```text
TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true
```

Seit LC-CORE-POINTS-3E wird die Legacy-Funktion bei deaktiviertem Zustand nicht mehr pro Event aufgerufen. Dadurch bleiben die Legacy-Zähler bei normalen Events sauber:

```text
legacy.forwarded = 0
legacy.skipped = 0
legacy.failed = 0
```

## Statusrouten

### Loyalty

```text
GET /api/loyalty/status
```

Wichtige Felder:

```text
version
twitchEventBonusBinding.installed
twitchEventBonusBinding.subscriptionCount
twitchEventBonusBinding.received
twitchEventBonusBinding.processed
twitchEventBonusBinding.skipped
twitchEventBonusBinding.errors
twitchEventBonusBinding.lastEventKey
twitchEventBonusBinding.lastLogin
```

### Twitch EventSub

```text
GET /api/twitch/eventsub/status
```

Wichtige Felder:

```text
twitchEventsParallel.supportEvents.enabled
twitchEventsParallel.supportEvents.forwarded
twitchEventsParallel.supportEvents.failed
twitchEventsParallel.supportEvents.lastEventSubType
twitchEventsParallel.supportEvents.lastUserLogin
legacyLoyaltyDirectForward.enabled
legacyLoyaltyDirectForward.forwarded
legacyLoyaltyDirectForward.skipped
legacyLoyaltyDirectForward.failed
```

## Bestätigte Live-Tests

### Cheer

```text
lastEventKey: twitch.cheer.received
lastLogin: akighosty
received: 1
processed: 1
skipped: 0
errors: 0
supportEvents.forwarded: 1
legacy.forwarded: 0
legacy.skipped: 0 nach 3E
```

### Follow

```text
lastEventKey: twitch.follow.received
lastLogin: bossmod_cgn
received: 1
processed: 1
skipped: 0
errors: 0
supportEvents.forwarded: 1
legacy.forwarded: 0
legacy.skipped: 0
```

## Minimaler Testblock

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status"
$loy.twitchEventBonusBinding | Select-Object received,processed,skipped,duplicates,errors,lastEventKey,lastLogin,lastError

$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status"
$t.twitchEventsParallel.supportEvents | Select-Object enabled,forwarded,failed,lastEventSubType,lastUserLogin,lastError
$t.legacyLoyaltyDirectForward | Select-Object enabled,forwarded,skipped,failed,lastEventSubType,lastUserLogin,lastError
```

## Nächster fachlicher Bereich

Twitch Events als zentrale Alert-Event-Quelle vorbereiten.

Nicht sofort umbauen. Erst prüfen:

```text
alert_system.js aktueller Event-Eingang
vorhandene Twitch-Event-Mappings
benötigte Alert-Daten pro Eventtyp
bestehende Legacy-Pfade
Tests und Rollback
```
