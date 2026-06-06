# CURRENT STATUS – VIP30

Stand: 2026-06-06 09:05 UTC

## Grün getestet

- STEP8.4 Stage B: VIP grant + slot + redemption fulfill/cancel
- STEP8.5 Cleanup Dry-Run / abgelaufene Slots
- STEP8.6 externe Slot-Freigabe per Bus-Simulation
- STEP8.7 echter Twitch EventSub `channel.vip.remove` bis Live-Bus
- STEP8.7.1 Routing-Fix für `/api/twitch/eventsub/status`

## Neu vorbereitet

- STEP8.8 VIP30 Dashboard Read-only ZIP erstellt

## STEP8.8 Dashboard

Neues eigenes Dashboard-Modul für 30TageVIP:

```txt
htdocs/dashboard/modules/vip30.js
htdocs/dashboard/modules/vip30.css
```

Eingebunden in:

```txt
htdocs/dashboard/index.html
htdocs/dashboard/app.js
```

Dashboard-Navigation:

```txt
Community -> 30 Tage VIP
```

Das vorhandene `vip.js` bleibt unverändert und gehört weiterhin zum VIP-/Mod-Sound-System.

## Dashboard-Funktionen

Read-only:

- Modulstatus / Version / Build
- aktive/freie Slots
- Slotliste
- Logs
- External VIP Remove Status
- Cleanup Check
- Twitch EventSub VIP Status
- Diagnose-JSON

## Safety

Keine produktiven Aktionen im Dashboard:

- kein VIP vergeben
- kein VIP entziehen
- kein Cleanup ausführen
- kein Fulfill/Cancel
- kein Test-Event
- kein Alert

## Aktueller bestätigter EventSub-Stand

```txt
vipEventBus.configured = True
knownRemove = True
knownAdd = True
channel.vip.add
channel.vip.remove
```

Echter Live-Test bestätigt:

```txt
akighosty -> external_removed
external_vip_remove_slot_released
```

## Nächster sinnvoller Schritt

STEP8.8 übernehmen und testen.

Danach:

```txt
STEP8.9 – VIP30 Alert planen
```
