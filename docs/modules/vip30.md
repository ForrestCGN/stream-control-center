# VIP30 / 30TageVIP

Stand: 2026-06-06 08:55 UTC  
Aktueller Modulstand: `vip30` Version `0.8.6`, Build `step8.6-external-vip-remove-slot-release`  
Aktueller getesteter Integrationsstand: STEP8.7.1

## Zweck

Das Modul `vip30` verwaltet den Kanalpunkte-Reward „30 Tage VIP“ vollständig im Node-/stream-control-center-System.

Kernaufgaben:

- VIP30-Reward-Entscheidung
- VIP-Vergabe über Twitch bei erfolgreicher Einlösung
- Slot-Speicherung für 30 Tage
- Redemption-Fulfill/Cancel
- Cleanup für abgelaufene Slots
- externe VIP-Entzüge erkennen und Slot freigeben
- Status-/Log-/Diagnose-Routen bereitstellen

## Wichtige Dateien

```txt
backend/modules/vip30.js
backend/modules/twitch.js
backend/modules/communication_bus.js
config/vip30.json
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Datenbank

Produktive Datenbank:

```txt
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Wichtige Tabellen:

```txt
vip30_slots
vip30_log
vip30_settings
```

Datenbank-Regel:

```txt
Nicht neu bauen.
Nicht überschreiben.
Nicht löschen.
Schemaänderungen nur sanft und geprüft.
```

## EventBus

VIP30 nutzt den Communication Bus.

Wichtige eingehende Events:

```txt
channelpoints.redemption / received
twitch.eventsub / channel.vip.remove
twitch.vip / remove
```

Wichtige ausgehende Events:

```txt
vip30.status
vip30.twitch
vip30.channelpoints
vip30.redeem
vip30.bridge
vip30.live
```

## STEP8.7 / STEP8.7.1

STEP8.7 ergänzt in `backend/modules/twitch.js` echte Twitch EventSub VIP-Events:

```txt
channel.vip.add
channel.vip.remove
```

Diese werden über den Bus weitergereicht:

```txt
channel: twitch.eventsub
action: channel.vip.remove
```

VIP30 hört darauf und verarbeitet externe VIP-Entzüge über die vorhandene STEP8.6-Logik.

## STEP8.7.1 Routing-Fix

Problem:

```txt
/api/twitch/eventsub/status?refresh=1
```

lieferte zuerst eine Helix-Subscription-Ausgabe statt den EventSub-Status-Snapshot.

Ursache:
`/api/twitch/eventsub/status` war zusätzlich beim Subscription-Listing registriert.

Korrektur:
Der Alias wurde aus dem Subscription-Listing entfernt. Die echte Statusroute bleibt:

```txt
/eventsub/status
/twitch/eventsub/status
/api/twitch/eventsub/status
```

## Bestätigte Tests

### EventSub-Status

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status?refresh=1"
$s.vipEventBus
$s.configuredSubscriptions | Where-Object { $_.type -like "channel.vip*" }
```

Ergebnis:

```txt
vipEventBus.configured = True
knownRemove = True
knownAdd = True

channel.vip.add
channel.vip.remove
```

### Echter Twitch VIP Remove Test

Test:

```txt
akighosty in Twitch manuell VIP gegeben
akighosty in Twitch manuell VIP entzogen
```

Ergebnis im VIP30-System:

```txt
akighosty -> external_removed
```

Log:

```txt
external_vip_remove_slot_released
success: True
reason: external_removed
message: Externer VIP-Entzug erkannt: aktiver VIP30-Slot wurde freigegeben.
```

Damit ist bestätigt:

```txt
Twitch channel.vip.remove
-> twitch.js
-> Communication Bus
-> vip30.js
-> Slot external_removed
-> Log geschrieben
```

## Safety

Bei externem VIP-Remove:

- kein Twitch-Write
- kein VIP-Grant
- kein Redemption-Fulfill/Cancel
- kein Alert
- keine Slot-Löschung
- Slot wird nur auf `external_removed` gesetzt

## Aktueller Slot-Stand nach STEP8.7.1-Test

```txt
akighosty / AkiGhosty
status: external_removed

younecraft / YouneCraft
status: external_removed
```

Damit sind aktuell keine aktiven VIP30-Testslots offen.

## Wichtige Routen

```txt
GET  /api/vip30/status
GET  /api/vip30/slots
GET  /api/vip30/logs
GET  /api/vip30/cleanup/check
POST /api/vip30/cleanup/run
GET  /api/vip30/external-vip-remove/status
POST /api/vip30/external-vip-remove/test
POST /api/vip30/external-vip-remove/process?confirm=YES
```

Twitch/EventSub:

```txt
GET /api/twitch/eventsub/status
GET /api/twitch/eventsub/reconcile
GET /api/twitch/eventsub/subscriptions
```

## Nächster Schritt

STEP8.8 planen:

```txt
VIP30-Alert bei erfolgreicher VIP30-Vergabe
```

Vor Umsetzung klären:

- bestehendes Alert-System oder eigenes VIP30-Overlay
- Trigger nur bei erfolgreichem VIP-Grant / Stage-B-Success
- keine Alerts bei externem VIP-Remove, Cleanup, Blockern oder Refund
- Textvarianten im CGN-/Altersheim-/Rentner-Stil
- Dashboardfähigkeit vorbereiten
- Diagnose-/Statusfelder prüfen
