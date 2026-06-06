# VIP30 / 30TageVIP

Stand: 2026-06-06  
Backend-Version: `0.8.7` / `step8.11-alert-bus-event`

## Zweck

VIP30 verwaltet den Kanalpunkte-Reward „30 Tage VIP“ im Node-/stream-control-center-System.

## STEP8.11 Alert Bus Event

Bei erfolgreichem VIP30-Live-Flow wird jetzt ein Bus-Event erzeugt:

```txt
channel: vip30.alert
action: trigger
```

Voraussetzungen:

```txt
alerts.enabled !== false
live.allowAlert === true
result.ok === true
```

Keine Auslösung bei:

```txt
Refund / Cancel
Blocker / Slot voll
already_has_vip30_slot
target_is_already_vip
Cleanup
external_removed
manuelle Admin-Aktionen
```

## Statusroute

```txt
GET /api/vip30/alert/status
```

## Dashboard

Normale VIP30-Seite bleibt Streamer-/Mod-tauglich:

```txt
Übersicht
Slots
Logs
Config
Aktionen mit Refresh
```

Admin-/Systemaktionen bleiben im TODO für später.

## Nächster Schritt

STEP8.12:

```txt
vip30.alert an bestehendes Alert-/Sound-System anbinden
```
