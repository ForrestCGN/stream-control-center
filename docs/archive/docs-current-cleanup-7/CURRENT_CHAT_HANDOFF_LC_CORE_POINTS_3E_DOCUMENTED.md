# CURRENT_CHAT_HANDOFF – LC-CORE-POINTS-3E DOCUMENTED

Stand: 2026-06-15
Projekt: `stream-control-center`
Kontext: Loyalty Core / Twitch Events / Communication Bus / EventSub-Bonus-Events

## Bestätigter Stand

```text
LC-CORE-POINTS-3E ist live bestätigt.
```

Der alte direkte Loyalty-Forward aus `backend/modules/twitch.js` ist standardmäßig deaktiviert und wird bei deaktiviertem Zustand nicht mehr pro Event aufgerufen. Der neue Weg über `twitch_events` und den Communication Bus verarbeitet Twitch-Support-Events erfolgreich.

## Aktueller Code-Stand

```text
backend/modules/loyalty.js  version 0.1.17
backend/modules/twitch.js   version 0.1.10
```

Wichtige Builds:

```text
LC_CORE_POINTS_3C_FILTERED_LOYALTY_SUBSCRIPTIONS_LEGACY_DIAGNOSTICS
LC_CORE_POINTS_3C1_TWITCH_EVENTSUB_STATUS_HOTFIX
LC_CORE_POINTS_3D_DISABLE_LEGACY_LOYALTY_DIRECT_FORWARD
LC_CORE_POINTS_3E_SKIP_DISABLED_LEGACY_LOYALTY_DIRECT_CALL
```

## Bestätigte Live-Tests

### Cheer-Test

```text
eventType: channel.cheer
login: akighosty
loyalty lastEventKey: twitch.cheer.received
loyalty received: 1
loyalty processed: 1
loyalty skipped: 0
loyalty errors: 0
supportEvents.forwarded: 1
legacy.forwarded: 0
legacy.skipped: 0 nach 3E
```

### Follow-Test

```text
eventType: channel.follow
login: bossmod_cgn
loyalty lastEventKey: twitch.follow.received
loyalty received: 1
loyalty processed: 1
loyalty skipped: 0
loyalty errors: 0
supportEvents.forwarded: 1
legacy.forwarded: 0
legacy.skipped: 0
```

Damit ist bestätigt:

```text
Twitch EventSub
→ backend/modules/twitch.js
→ twitch_events.handleEventSubNotification(...)
→ Communication Bus
→ loyalty gezielte Twitch-Event-Bonus-Subscription
→ recordEventBonus(...)
→ Loyalty-Event + Transaktion
```

## Aktueller Status der Loyalty-Bindings

`loyalty` abonniert nicht mehr breit `sourceModule=twitch_events + action=received`, sondern gezielt 7 Channels:

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

Erwartete wichtige Felder:

```text
version: 0.1.17
twitchEventBonusBinding.installed: true
twitchEventBonusBinding.subscriptionCount: 7
twitchEventBonusBinding.errors: 0
```

## Aktueller Status des Twitch EventSub-Pfads

Statusroute:

```text
GET /api/twitch/eventsub/status
```

Wichtige Blöcke:

```text
twitchEventsParallel.supportEvents
legacyLoyaltyDirectForward
```

Erwartung:

```text
twitchEventsParallel.supportEvents.enabled: true
legacyLoyaltyDirectForward.enabled: false
legacyLoyaltyDirectForward.forwarded: 0
legacyLoyaltyDirectForward.skipped: 0
legacyLoyaltyDirectForward.failed: 0
```

## Legacy-Direktforward

Der alte direkte Loyalty-Direktforward bleibt als Notfall-Fallback im Code vorhanden, ist aber standardmäßig deaktiviert.

Standard:

```text
TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD nicht gesetzt
→ Legacy-Direktforward disabled
```

Notfall-Reaktivierung:

```text
TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true
```

Wichtig: Nur als Notfall-Fallback verwenden, wenn der neue Bus-Weg ausfällt.

## Geänderte Dateien seit LC-CORE-POINTS-3A

```text
backend/modules/twitch.js
backend/modules/loyalty.js
```

## Nicht geändert

```text
backend/modules/twitch_events.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
Dashboard-Dateien
Overlays
Streamer.bot
produktive SQLite-Datenbank
Punkteberechnung
Alert-System
Donation-/Tip-Events
```

## StepDone-Befehle

Falls noch nicht ausgeführt:

```powershell
.\stepdone.cmd "LC-CORE-POINTS-3E deaktivierter Legacy Loyalty Direktforward live bestätigt"
.\stepdone.cmd "LC-CORE-POINTS-3E Dokumentation und Handoff aktualisiert"
```

## Nächster sinnvoller Schritt

Nicht weiter am Loyalty-Bonus-Event-Pfad bauen, solange keine Fehler auftreten.

Nächster technischer Bereich laut Projektziel:

```text
Twitch Events als zentrale Alert-Event-Quelle vorbereiten.
```

Dabei gilt:

1. Alert-System noch nicht komplett umbauen.
2. Zuerst prüfen, welche Alert-Events aktuell schon existieren.
3. Prüfen, wie `alert_system.js` aktuell Events bekommt.
4. Prüfen, welche Twitch-Event-Typen für Alerts nötig sind.
5. Erst Plan machen, dann auf `go` warten.

## Minimaler Health-Check für neuen Chat

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status"
$loy | Select-Object ok,module,version,lastError
$loy.twitchEventBonusBinding | Select-Object installed,subscriptionCount,received,processed,skipped,duplicates,errors,lastEventKey,lastLogin,lastError

$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status"
$t | Select-Object ok,module
$t.twitchEventsParallel.supportEvents | Select-Object enabled,forwarded,failed,lastEventSubType,lastUserLogin,lastError
$t.legacyLoyaltyDirectForward | Select-Object enabled,forwarded,skipped,failed,lastEventSubType,lastUserLogin,lastError
```

## Wichtig für den nächsten Chat

Keine Fake-/Test-Route blind bauen.
Keine Legacy-Logik entfernen, nur weil sie deaktiviert ist.
Vor Entfernung erst prüfen:

```text
Follow/Sub/Resub/SubGift/GiftBomb/Cheer/Raid mehrfach live oder per sauberem dev-only Smoke-Test bestätigt?
Fallback wirklich nicht mehr benötigt?
Doku und Rollback klar?
```
