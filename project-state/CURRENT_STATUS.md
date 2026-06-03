# CURRENT_STATUS

## Stand: CAN-39.2 vorbereitet

CAN-39.2 ergänzt eine dedizierte Overlay-Monitor-Doku mit Read-only-/Write-Regeln.

## Aktueller Arbeitsbereich

```text
CAN-39: Overlay-Monitor / Overlay-Dashboard read-only Analyse und Glättung
```

## Ergebnis CAN-39.1 Analyse

Aktives Overlay-Monitor-Modul:

```text
backend/modules/overlay_monitor.js
```

Modulstand:

```text
MODULE = overlay_monitor
VERSION = 0.1.8
STATUS_API_VERSION = 1.0.8
build = CAN-26.2
routesPrefix = /api/overlay-monitor
```

Vorhanden:

```text
MODULE_META
/api/overlay-monitor/status
/api/overlay-monitor/client-control/status
/api/overlay-monitor/client-control/classification
/api/overlay-monitor/client-control/identity-contract
/api/overlay-monitor/issues
/api/overlay-monitor/obs-inventory
/api/overlay-monitor/events
/api/overlay-monitor/routes
POST /api/overlay-monitor/obs-source/action
Dashboard htdocs/dashboard/modules/overlays.js
```

Nicht vorhanden war bisher:

```text
docs/modules/overlay_monitor.md
```

## Änderung CAN-39.2

Neu:

```text
docs/modules/overlay_monitor.md
```

Darin festgehalten:

```text
- Modulzweck
- MODULE_META / Version / Routenprefix
- Bus-Registrierung und Heartbeat
- Konfiguration
- Monitoring-Issues und Inventory-Cache
- Hintergrund-Monitoring
- read-only Statusrouten
- Overlay Client Control Status
- OBS-Inventar-Route
- produktive/manuelle OBS-Reparaturroute
- Dashboard-Routen
- Dashboard-Auto-Refresh
- produktive Dashboard-Aktionen
- Regeln für spätere Overlay-Monitor-Erweiterungen
```

## Wichtigste Sicherheitsentscheidung

Read-only Diagnose darf lesen:

```text
GET /api/overlay-monitor/status
GET /api/overlay-monitor/client-control/status
GET /api/overlay-monitor/client-control/classification
GET /api/overlay-monitor/client-control/identity-contract
GET /api/overlay-monitor/issues
GET /api/overlay-monitor/events
GET /api/overlay-monitor/routes
GET /api/obs/status
GET /api/obs/browser-sources
GET /api/obs/scenes
```

Vorsichtig / nicht automatisch:

```text
GET /api/overlay-monitor/obs-inventory?refresh=1
GET /api/obs/scene-items?scene=...
```

Nicht automatisch auslösen:

```text
POST /api/overlay-monitor/obs-source/action
```

## Nicht geändert

```text
Keine Codeänderung.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine Overlay-Refresh-Aktion.
Keine Queue-Aktion.
Keine produktive Sound-/Alert-Aktion.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Twitch-/Chat-/Discord-Nachricht.
Keine Funktionalität entfernt.
```

## Nächster Schritt

```text
CAN-39.2 anwenden.
Danach optional CAN-39.3 Overlay-Monitor Übersicht optisch vereinfachen / produktive Aktionen klarer markieren.
```
