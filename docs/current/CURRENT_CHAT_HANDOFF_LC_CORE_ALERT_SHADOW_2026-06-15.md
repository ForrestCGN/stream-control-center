# CURRENT_CHAT_HANDOFF – LC Core + Twitch Events + Alert Shadow

Stand: 2026-06-15
Projekt: `stream-control-center`
Kontext: Loyalty Core / Twitch Events / Communication Bus / Alert-System Shadow-Anbindung

## Kurzstatus

```text
Loyalty Core nutzt Twitch-Events produktiv über den Communication Bus.
Der alte direkte Loyalty-Forward ist standardmäßig deaktiviert.
Alert-System hört im Shadow-Modus auf Twitch-Events, löst aber noch keine produktiven Bus-Alerts aus.
Produktive Alerts laufen weiterhin über den alten Alert-Direktpfad.
```

## Abgeschlossene und live bestätigte Schritte

### LC-CORE-POINTS-3B

```text
Twitch Support-Events werden aus twitch.js parallel an twitch_events weitergereicht.
Live bestätigt mit channel.cheer / akighosty.
```

Bestätigte Kette:

```text
Twitch EventSub
→ backend/modules/twitch.js
→ twitch_events.handleEventSubNotification(...)
→ Communication Bus
→ loyalty twitchEventBonusBinding
→ recordEventBonus()
→ Loyalty-Event + Transaktion
```

### LC-CORE-POINTS-3C

```text
loyalty.js nutzt 7 gezielte Bus-Subscriptions statt breitem received-Filter.
```

Abonnierte Channels:

```text
twitch.follow   / received
twitch.sub      / received
twitch.resub    / received
twitch.subgift  / received
twitch.giftbomb / received
twitch.cheer    / received
twitch.raid     / received
```

Live bestätigt:

```text
loyalty.twitchEventBonusBinding.subscriptionCount = 7
skipped bleibt bei echten Support-Events 0
```

### LC-CORE-POINTS-3C1

```text
Hotfix für /api/twitch/eventsub/status.
Fehlerhafte Referenz getTwitchAlertBridgeConfig() wurde entfernt.
```

Bestätigt:

```text
GET /api/twitch/eventsub/status → ok: True
```

### LC-CORE-POINTS-3D

```text
Alter Loyalty-Direktforward in twitch.js ist standardmäßig deaktiviert.
Fallback bleibt per Env möglich.
```

Fallback:

```text
TWITCH_EVENTSUB_LOYALTY_DIRECT_FORWARD=true
```

Live bestätigt:

```text
legacyLoyaltyDirectForward.enabled = False
legacyLoyaltyDirectForward.forwarded = 0
legacyLoyaltyDirectForward.failed = 0
```

### LC-CORE-POINTS-3E

```text
Wenn Legacy-Loyalty-Direktforward deaktiviert ist, wird die Legacy-Funktion nicht mehr pro Event aufgerufen.
```

Live bestätigt mit Follow-Test:

```text
lastEventKey: twitch.follow.received
lastLogin: bossmod_cgn
received: 1
processed: 1
skipped: 0
errors: 0
legacy.forwarded: 0
legacy.skipped: 0
```

Zusätzlich erneut bestätigt mit 10 Bits:

```text
lastEventKey: twitch.cheer.received
lastLogin: akighosty
received: 1
processed: 1
skipped: 0
errors: 0
```

## Alert-System Stand

### ALERT-TWITCH-1A

```text
alert_system.js subscribed im Shadow-Modus auf Twitch-Events.
Kein produktives Enqueue.
```

Live bestätigt mit Cheer/Bits:

```text
received: 1
mapped: 1
wouldEnqueue: 1
enqueued: 0
skipped: 0
errors: 0
lastEventKey: twitch.cheer.received
lastLogin: akighosty
lastTypeKey: bits
```

### ALERT-TWITCH-1B

```text
Alert-Bus-Weg ist schaltbar vorbereitet.
Standard bleibt shadow.
Produktiver Bus-Modus benötigt bewusste doppelte Freigabe.
```

Env-Schalter für später:

```text
ALERT_TWITCH_EVENTS_ALERT_MODE=bus
ALERT_TWITCH_EVENTS_ALERT_ALLOW_BUS=true
```

Bestätigter sicherer Zustand:

```text
requestedMode: shadow
effectiveMode: shadow
productiveEnqueue: False
enqueued: 0
errors: 0
```

## Aktuelle Routen für Diagnose

### Twitch EventSub / Forwarding

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status"
$t.twitchEventsParallel.supportEvents | Select-Object enabled,forwarded,skipped,duplicateSkipped,failed,lastEventSubType,lastUserLogin,lastError
$t.legacyLoyaltyDirectForward | Select-Object enabled,forwarded,skipped,failed,lastEventSubType,lastUserLogin,lastError
```

### Twitch Events zentral

```powershell
$tw = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$tw.diagnostics.counts
$tw.diagnostics.runtime.lastEvent
```

### Loyalty Core

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status"
$loy.twitchEventBonusBinding | Select-Object received,processed,skipped,duplicates,errors,lastEventKey,lastLogin,lastError
```

### Alert Shadow

```powershell
$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch-events/status"
$a | Select-Object installed,requestedMode,effectiveMode,productiveEnqueue,received,mapped,wouldEnqueue,enqueued,blocked,skipped,errors,lastEventKey,lastLogin,lastTypeKey,lastError
```

## Wichtige Entscheidung für die nächsten Streams

Die neue Alert-Anbindung über `twitch_events` / Communication Bus soll erst über mehrere Streams im Shadow-/Diagnosemodus beobachtet werden.

Nicht sofort umschalten.
Nicht sofort alte Alert-Route löschen.

Erst über echte Events prüfen:

```text
follow
raid
sub
resub
subgift
giftbomb
cheer/bits
```

Danach kann geplant werden:

```text
ALERT-TWITCH-1C – alten Alert-Direktpfad in twitch.js diagnostisch sichtbar und schaltbar machen
ALERT-TWITCH-1D – Bus-Alert-Modus kontrolliert aktivieren
ALERT-TWITCH-CLEANUP – alte direkte Alert-Route entfernen/deaktivieren, wenn stabil
```

## Aktuell nicht ändern

```text
Alert-System nicht produktiv auf Bus schalten.
Alten Alert-Direktpfad nicht entfernen.
Keine DB ändern.
Keine Overlays ändern.
Keine Dashboard-Umschaltung bauen, bevor 1C sauber geplant ist.
```

## Aktueller Code-Stand aus diesem Chat

```text
loyalty.js: 0.1.17
twitch.js: 0.1.10
alert_system.js: 3.1.12
```

## Letzte bekannte bestätigte Live-Tests

```text
Follow bossmod_cgn:
- loyalty processed über Bus
- legacy Loyalty aus

Cheer/Bits akighosty:
- twitch.js supportEvents.forwarded = 1
- loyalty processed = 1
- alert_system shadow mapped bits = 1
- alert_system enqueued = 0
```
