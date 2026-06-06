# VIP30 / 30TageVIP

Stand: 2026-06-06 09:05 UTC  
Aktueller Backend-Modulstand: `vip30` Version `0.8.6`, Build `step8.6-external-vip-remove-slot-release`  
Aktueller Integrationsstand: STEP8.8 Dashboard Read-only

## Zweck

Das Modul `vip30` verwaltet den Kanalpunkte-Reward „30 Tage VIP“ im Node-/stream-control-center-System.

Kernaufgaben:

- VIP30-Reward-Entscheidung
- VIP-Vergabe über Twitch bei erfolgreicher Einlösung
- Slot-Speicherung für 30 Tage
- Redemption-Fulfill/Cancel
- Cleanup für abgelaufene Slots
- externe VIP-Entzüge erkennen und Slot freigeben
- Status-/Log-/Diagnose-Routen bereitstellen
- Dashboard-Read-only-Anzeige

## Wichtige Dateien

Backend:

```txt
backend/modules/vip30.js
backend/modules/twitch.js
backend/modules/communication_bus.js
```

Dashboard:

```txt
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
htdocs/dashboard/index.html
htdocs/dashboard/app.js
```

Doku/Status:

```txt
docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_8_DASHBOARD.md
docs/modules/vip30.md
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

STEP8.7.1 korrigierte den Routing-Konflikt bei:

```txt
/api/twitch/eventsub/status
```

## Bestätigte Tests STEP8.7.1

EventSub-Status:

```txt
vipEventBus.configured = True
knownRemove = True
knownAdd = True
channel.vip.add
channel.vip.remove
```

Echter Twitch VIP Remove Test:

```txt
akighosty -> external_removed
external_vip_remove_slot_released
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

## STEP8.8 Dashboard Read-only

Neues Dashboard-Modul:

```txt
vip30
```

Navigation:

```txt
Community -> 30 Tage VIP
```

Neue Dateien:

```txt
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

Geänderte Dashboard-Dateien:

```txt
htdocs/dashboard/index.html
htdocs/dashboard/app.js
```

Wichtig:
Das bestehende Dashboard-Modul `vip.js` bleibt unverändert und gehört weiterhin zum VIP-/Mod-Sound-System.

## Dashboard API-Routen

```txt
GET /api/vip30/status
GET /api/vip30/slots?limit=20
GET /api/vip30/logs?limit=12
GET /api/vip30/external-vip-remove/status
GET /api/vip30/cleanup/check
GET /api/twitch/eventsub/status?refresh=1
```

## Dashboard Safety

Das VIP30-Dashboard ist in STEP8.8 rein read-only.

Nicht enthalten:

- kein VIP vergeben
- kein VIP entziehen
- kein Cleanup ausführen
- kein Redemption fulfill/cancel
- kein External-Remove process
- kein Test-Event auslösen
- kein Alert
- keine Backend-Änderung
- keine DB-Änderung

## Dashboard Tabs

```txt
Übersicht
Slots
Logs
Diagnose
```

## Aktueller Slot-Stand nach STEP8.7.1-Test

```txt
akighosty / AkiGhosty
status: external_removed

younecraft / YouneCraft
status: external_removed
```

Damit sind aktuell keine aktiven VIP30-Testslots offen.

## Tests für STEP8.8

Nach ZIP-Übernahme:

```powershell
cd /d D:\Git\stream-control-center
node --check htdocs\dashboard\app.js
node --check htdocs\dashboard\modules\vip30.js
.\stepdone.cmd "VIP30-STEP8.8 Dashboard Readonly"
```

Danach Live-System aktualisieren/Node neu starten und im Browser prüfen:

```txt
/dashboard
Community -> 30 Tage VIP
```

## Nächster Schritt

STEP8.9 planen:

```txt
VIP30-Alert bei erfolgreicher VIP30-Vergabe
```

Vor Umsetzung klären:

- bestehendes Alert-System oder eigenes VIP30-Overlay
- Trigger nur bei erfolgreicher VIP30-Vergabe
- keine Alerts bei external_removed, Cleanup, Blockern oder Refund
- Textvarianten im CGN-/Altersheim-/Rentner-Stil
- Dashboardfähigkeit der Alert-Config
