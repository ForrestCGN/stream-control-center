# CURRENT_CHAT_HANDOFF – LC-CORE-POINTS-3D DOCUMENTED

Stand: 2026-06-15
Projekt: `stream-control-center`
Kontext: Loyalty Core / Twitch Events / Communication Bus / EventSub-Bonus-Events

## Bestätigter Stand

```text
LC-CORE-POINTS-3B: live bestätigt
LC-CORE-POINTS-3C: live bestätigt
LC-CORE-POINTS-3C1: Hotfix bestätigt
LC-CORE-POINTS-3D: live bestätigt
```

## Ziel des abgeschlossenen Blocks

`twitch_events` ist jetzt der produktive zentrale Weg für Twitch-Support-Events, die Loyalty-Punkte auslösen.

Der alte direkte EventSub→Loyalty-Forward in `twitch.js` wurde nicht gelöscht, aber standardmäßig deaktiviert und bleibt nur als Notfall-Fallback per Env-Schalter verfügbar.

## Aktueller Code-Stand

### `backend/modules/loyalty.js`

```text
Version: 0.1.17
```

Wichtig:

- Loyalty abonniert Twitch-Bonus-Events jetzt gezielt über den Communication Bus.
- Es gibt 7 gezielte Subscriptions statt einer breiten `sourceModule=twitch_events + action=received` Subscription.
- Dadurch werden rohe/systemnahe EventSub-Events nicht mehr als `skipped` in Loyalty mitgezählt.

Aktive Subscriptions:

```text
twitch.follow   / received
twitch.sub      / received
twitch.resub    / received
twitch.subgift  / received
twitch.giftbomb / received
twitch.cheer    / received
twitch.raid     / received
```

Statusroute:

```text
GET /api/loyalty/status
```

Erwarteter Statusblock:

```text
twitchEventBonusBinding.installed = true
twitchEventBonusBinding.subscriptionCount = 7
twitchEventBonusBinding.errors = 0
```

### `backend/modules/twitch.js`

```text
Version: 0.1.9
Build: LC_CORE_POINTS_3D_DISABLE_LEGACY_LOYALTY_DIRECT_FORWARD
```

Wichtig:

- produktive Support-EventSub-Events werden parallel an `twitch_events.handleEventSubNotification(...)` weitergereicht.
- Der alte direkte Loyalty-Forward ist standardmäßig deaktiviert.
- Notfall-Fallback ist möglich mit:

```text
TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true
```

Statusroute:

```text
GET /api/twitch/eventsub/status
```

Neue Diagnoseblöcke:

```text
twitchEventsParallel.supportEvents
legacyLoyaltyDirectForward
```

## Live-Test 3B / 3C / 3D

### 3B – erster Bus-Weg-Test

Echter Event:

```text
channel.cheer
login: akighosty
```

Bestätigt:

```text
supportEvents.forwarded = 1
loyalty.twitchEventBonusBinding.received = 1
loyalty.twitchEventBonusBinding.processed = 1
loyalty.twitchEventBonusBinding.errors = 0
```

### 3C – gefilterte Loyalty-Subscriptions

Nach Version 0.1.17:

```text
subscriptionCount = 7
received = 1
processed = 1
skipped = 0
errors = 0
lastEventKey = twitch.cheer.received
lastLogin = akighosty
```

Damit ist bestätigt, dass rohe `twitch.eventsub.notification.received` Events nicht mehr unnötig in Loyalty als `skipped` landen.

### 3D – Legacy-Direktforward deaktiviert

Bestätigter Status nach Restart:

```text
legacyLoyaltyDirectForward.enabled = false
legacyLoyaltyDirectForward.configEnabled = true
legacyLoyaltyDirectForward.envOverrideRequired = true
legacyLoyaltyDirectForward.disabledReason = disabled_by_default_bus_path_active
```

Echter Event danach:

```text
lastEventSubType = channel.cheer
lastUserLogin = akighosty
supportEvents.forwarded = 1
legacyLoyaltyDirectForward.forwarded = 0
legacyLoyaltyDirectForward.skipped = 1
legacyLoyaltyDirectForward.failed = 0
loyalty.processed = 1
loyalty.skipped = 0
loyalty.errors = 0
```

Bewertung:

```text
Der neue Bus-Weg verarbeitet Support-Events alleine korrekt.
Der alte Direktpfad schreibt nicht mehr.
Der alte Direktpfad wird nur noch diagnostisch als skipped sichtbar, wenn deaktiviert.
```

## Eingespielte Steps / ZIPs

### LC-CORE-POINTS-3B

```text
LC_CORE_POINTS_3B_twitch_support_events_parallel.zip
backend/modules/twitch.js
```

Inhalt:

- Support-EventSub-Events zusätzlich an `twitch_events` weitergereicht.
- Legacy-Direktforward blieb aktiv.

StepDone:

```powershell
.\stepdone.cmd "LC-CORE-POINTS-3B Twitch Support-Events parallel an Twitch-Events angebunden"
```

### LC-CORE-POINTS-3C

```text
LC_CORE_POINTS_3C_filtered_loyalty_subscriptions_legacy_diagnostics.zip
backend/modules/loyalty.js
backend/modules/twitch.js
```

Inhalt:

- Loyalty-Subscriptions auf 7 gezielte Support-Channels umgestellt.
- Legacy-Direktforward diagnostisch sichtbar gemacht.

StepDone:

```powershell
.\stepdone.cmd "LC-CORE-POINTS-3C Loyalty filtert Twitch-Event-Bonus-Subscriptions und Twitch zeigt Legacy-Direktforward diagnostisch"
```

### LC-CORE-POINTS-3C1

```text
LC_CORE_POINTS_3C1_twitch_eventsub_status_hotfix.zip
backend/modules/twitch.js
```

Inhalt:

- Hotfix für `/api/twitch/eventsub/status`.
- Fehler behoben: `ReferenceError: getTwitchAlertBridgeConfig is not defined`.

StepDone:

```powershell
.\stepdone.cmd "LC-CORE-POINTS-3C1 Twitch EventSub Statusroute Hotfix"
```

### LC-CORE-POINTS-3D

```text
LC_CORE_POINTS_3D_disable_legacy_loyalty_direct_forward.zip
backend/modules/twitch.js
```

Inhalt:

- Legacy EventSub→Loyalty Direktforward standardmäßig deaktiviert.
- Fallback per Env `TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true` bleibt möglich.

StepDone:

```powershell
.\stepdone.cmd "LC-CORE-POINTS-3D Legacy Loyalty Direktforward deaktiviert und Bus-Weg live bestätigt"
```

## Minimalprüfungen für neuen Chat

### Loyalty

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status"
$loy | Select-Object ok,module,version,lastError
$loy.twitchEventBonusBinding | Select-Object installed,subscriptionCount,received,processed,skipped,duplicates,errors,lastEventKey,lastLogin,lastError
$loy.twitchEventBonusBinding.subscriptions
```

Erwartung:

```text
ok = True
version = 0.1.17
installed = True
subscriptionCount = 7
errors = 0
```

### Twitch EventSub

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status"
$t | Select-Object ok,module
$t.twitchEventsParallel.supportEvents | Select-Object enabled,forwarded,skipped,duplicateSkipped,failed,lastEventSubType,lastUserLogin,lastError
$t.legacyLoyaltyDirectForward | Select-Object enabled,configEnabled,envOverrideRequired,envValue,disabledReason,forwarded,skipped,failed,lastEventSubType,lastUserLogin,lastError
```

Erwartung:

```text
ok = True
supportEvents.enabled = True
legacyLoyaltyDirectForward.enabled = False
legacyLoyaltyDirectForward.disabledReason = disabled_by_default_bus_path_active
failed = 0
lastError leer
```

## Offene Punkte

1. Noch ein bis zwei echte Events anderer Typen testen:
   - Follow
   - Sub/Resub
   - Raid
   - GiftSub/GiftBomb

2. Danach entscheiden, ob Legacy-Code komplett entfernt wird oder als deaktivierter Notfall-Fallback noch eine Weile bleibt.

3. Alert-System danach separat planen.
   - Nicht automatisch durch diese Loyalty-Arbeit anfassen.
   - Ziel bleibt: Alerts später ebenfalls über das zentrale `twitch_events` Modul abonnierbar nutzen.

4. Donation-/Tip-Events bleiben separat zu planen.
   - Nicht als Twitch-natives Event behandeln.
   - Später neutrales Payment-/Donation-Event planen.

## Nicht geändert

```text
Alert-System
Dashboard
Overlays
produktive SQLite-Datenbank
Streamer.bot
Punkteberechnung
Communication-Bus
Twitch-Events-Mapping in twitch_events.js
```

## Empfehlung für nächsten Chat

Nicht weiter am Code bauen, bevor die Doku/Projektstände geprüft sind.

Nächster sinnvoller Arbeitsblock:

```text
LC-CORE-POINTS-3E – weitere echte Eventtypen prüfen und Legacy-Cleanup-Entscheidung treffen
```

Oder, wenn Forrest zurück zum ursprünglichen Ziel möchte:

```text
Twitch Events → Alert-System Integration planen
```

Dabei zuerst nur prüfen/planen, keine Umsetzung ohne `go`.
