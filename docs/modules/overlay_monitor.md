# Overlay-Monitor

## Zweck

Das Modul `backend/modules/overlay_monitor.js` stellt Monitoring, Diagnose und manuelle Reparaturpfade für Overlay-Clients bereit.

Es arbeitet auf Basis des vorhandenen Communication Bus und wertet Overlay-Clients, Heartbeats, OBS-Browserquellen, Szenen-/Quellen-Inventar, Scene-Awareness und persistierte Monitoring-Issues aus.

Wichtig:

```text
Das Modul ist nicht nur reine Anzeige.
Es enthält read-only Statusrouten, schreibt aber im Hintergrund Monitoring-Issues/Inventory-Cache und besitzt eine manuelle OBS-Reparaturroute.
```

## Modul-Dateien

```text
backend/modules/overlay_monitor.js
htdocs/dashboard/modules/overlays.js
htdocs/dashboard/modules/overlays.css
```

## Modul-Metadaten

Aktueller Analyse-Stand CAN-39.1:

```text
MODULE = overlay_monitor
VERSION = 0.1.8
MODULE_VERSION = 0.1.8
STATUS_API_VERSION = 1.0.8
build = CAN-26.2
routesPrefix = /api/overlay-monitor
```

`MODULE_META`:

```text
name: overlay_monitor
version: 0.1.8
type: runtime
category: diagnostics
legacy: false
description: Read-only Overlay-Monitor mit robuster Scene-Awareness-Diagnose, OBS-Inventar und manuellen Reparaturaktionen.
```

Bus-Block:

```text
bus.registered = true
bus.heartbeat = true
bus.emits = overlay_monitor.status, overlay_monitor.issue
bus.listens = communication.clients
```

## Grundsatz

Das Modul darf für Status/Dashboard-Diagnose gelesen werden.

Produktive bzw. manuelle Aktionen dürfen nicht automatisch ausgelöst werden:

```text
Keine OBS-Reparatur automatisch.
Kein Source-Refresh automatisch.
Keine automatische Recovery.
Keine Overlay-Refresh-Aktion automatisch.
Keine Queue-Aktion.
Keine produktive Sound-/Alert-Aktion.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Twitch-/Chat-/Discord-Nachricht.
Keine Funktionalität entfernen.
```

## Konfiguration

Default-Konfiguration:

```text
enabled = true
readOnly = true
monitorIntervalMs = 5000
maxEvents = 100
publishStatusToBus = true
publishStatusEveryMs = 15000
emitStatusChangesToBus = true
overlayClientType = overlay
```

Thresholds:

```text
staleAfterMs = 15000
offlineAfterMs = 30000
deadAfterMs = 60000
```

Logging:

```text
consoleEnabled = true
seenConsole = false
suppressOnlineStaleConsole = true
statusChangeThrottleMs = 60000
alwaysLogStatuses = offline, dead
alwaysLogTypes = overlay_missing
```

## Datenbank / Tabellen

Das Modul nutzt mindestens:

```text
monitoring_issues
monitoring_obs_inventory_cache
```

Schema-Konstanten:

```text
ISSUE_SCHEMA_VERSION = 1
INVENTORY_SCHEMA_VERSION = 1
```

`monitoring_issues` speichert aktive und gelöste Monitoring-Issues:

```text
issue_key
scope
target_type
target_name
severity
status
first_seen_at
last_seen_at
resolved_at
seen_count
message
resolved_message
details_json
```

`monitoring_obs_inventory_cache` speichert das OBS-Inventar:

```text
id
updated_at
data_json
```

## Hintergrund-Monitoring

Das Modul startet beim Init:

```text
scan()
getObsInventory(..., { force: true })
startTimer()
```

`scan()`:

```text
publishModuleHeartbeat()
getOverlayStatus()
processStatusChanges()
syncMonitoringIssues()
maybePublishStatus()
```

Das bedeutet:

```text
Der Hintergrundmonitor kann Monitoring-Issues in die DB schreiben/aktualisieren und Status auf den Bus publizieren.
```

Für Dashboard-/Diagnose-Steps gilt:

```text
Keine zusätzlichen produktiven Aktionen ergänzen.
Keine Reparatur-/Refresh-/Recovery-Aktionen auslösen.
```

## Read-only Status

Sichere Haupt-Statusroute:

```text
GET /api/overlay-monitor/status
```

`getOverlayStatus()` liefert unter anderem:

```text
readOnly = true
overlayTouched = false
obsTouched = false
refreshTouched = false
communication
config
summary
sceneAwareness
overlays
issues
recentEvents
stats
```

## Overlay Client Control Status

Sichere Kontroll-/Übersichtsroute:

```text
GET /api/overlay-monitor/client-control/status
```

Sie liefert:

```text
feature = overlay_client_control_status
mode = read_only_overlay_clients
readOnly = true
overlayTouched = false
obsTouched = false
obsRefreshTriggered = false
obsRepairTriggered = false
eventBusEmit = false
recoveryTriggered = false
```

Diese Route ist für Dashboard-Sichtbarkeit und Bus-Diagnose geeignet.

## Weitere read-only Routen

```text
GET /api/overlay-monitor/client-control/classification
GET /api/overlay-monitor/client-control/identity-contract
GET /api/overlay-monitor/issues
GET /api/overlay-monitor/events
GET /api/overlay-monitor/routes
```

Hinweis:

```text
GET /api/overlay-monitor/events gibt aktuell readOnly=false/manualActions=true in der Payload aus, weil das Modul manuelle Aktionen besitzt.
Die Route selbst listet aber Events und Stats.
```

## OBS-Inventar Route

```text
GET /api/overlay-monitor/obs-inventory
GET /api/overlay-monitor/obs-inventory?refresh=1
```

Ein normaler GET kann aus Cache/Speicher liefern.

Mit `refresh=1` wird OBS-Inventar aktiv aktualisiert und der Cache kann geschrieben werden.

Deshalb gilt:

```text
GET /api/overlay-monitor/obs-inventory ohne refresh ist eher Anzeige/Lesen.
GET /api/overlay-monitor/obs-inventory?refresh=1 berührt OBS-Abfragen und Inventory-Cache.
Nicht als strikte reine Anzeige einstufen.
```

## Produktive / manuelle Reparaturroute

Nicht automatisch auslösen:

```text
POST /api/overlay-monitor/obs-source/action
```

Mögliche Aktionen:

```text
refresh
reload
refresh-cache
cache
nocache
show
enable
hide
disable
toggle
cycle
restart
hide-show
```

Diese Route kann:

```text
Browserquellen neu laden
Browserquellen mit Cache-Refresh neu laden
SceneItems anzeigen/verstecken
SceneItems toggeln
SceneItems kurz aus- und wieder einschalten
danach OBS-Inventar neu laden
```

Sie darf nur nach eigener, ausdrücklicher Freigabe verwendet werden.

## Dashboard

Dashboard-Datei:

```text
htdocs/dashboard/modules/overlays.js
```

Dashboard lädt unter anderem:

```text
GET /api/overlay-monitor/status?events=10
GET /api/obs/status
GET /api/obs/browser-sources
GET /api/obs/scenes
GET /api/overlay-monitor/issues?status=all&limit=150
GET /api/overlay-monitor/obs-inventory
POST /api/overlay-monitor/obs-source/action
```

Auto-Refresh:

```text
autoRefresh = true
AUTO_REFRESH_MS = 5000
```

Tabs/Ansichten sind im Dashboard über `state.tab` gesteuert, unter anderem:

```text
overview
sources
details
inventory
bus
obs
issues
raw
```

## Dashboard: Übersicht

Die Übersicht enthält bereits wichtige Erklärungen:

```text
Ausgeblendet ist nicht kaputt
Externe Quellen
Sichtbar + kein Heartbeat
Reparatur folgt später
```

Diese Texte sind gut und sollen erhalten bleiben.

## Dashboard: produktive Aktionen

Produktive Reparaturbuttons werden über Quellenkarten gerendert und führen am Ende `runSourceAction()` aus.

`runSourceAction()` ruft:

```text
POST /api/overlay-monitor/obs-source/action
```

Dabei gibt es Confirm-Abfragen für sichtbare/toggle/cycle/hide/cache Aktionen.

Regel:

```text
Diese Buttons nie automatisch testen.
Keine Diagnose-Erweiterung darf diese POST-Route auslösen.
```

## Dashboard: OBS-Inventar aktualisieren

Im Inventar-Tab gibt es:

```text
OBS-Inventar aktualisieren
```

Das führt über `loadAll(true)` zu:

```text
GET /api/overlay-monitor/obs-inventory?refresh=1
```

Regel:

```text
Als manuelle Diagnose-/Refresh-Aktion behandeln.
Nicht automatisch auslösen.
Deutlich markieren: liest OBS aktiv und kann Inventory-Cache aktualisieren.
```

## Sichere Read-only Diagnose-Routen für zukünftige Dashboard-Erweiterungen

Erlaubt:

```text
GET /api/overlay-monitor/status
GET /api/overlay-monitor/client-control/status
GET /api/overlay-monitor/client-control/classification
GET /api/overlay-monitor/client-control/identity-contract
GET /api/overlay-monitor/issues?status=all&limit=150
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

Verboten ohne separaten Go-Schritt:

```text
POST /api/overlay-monitor/obs-source/action
```

## Sicherheitsregel für zukünftige Overlay-Monitor-Erweiterungen

Für spätere Dashboard-Diagnosekarten gilt:

```text
Read-only Diagnose:
- darf Overlay-Monitor-Status lesen
- darf Overlay-Client-Control-Status lesen
- darf Classification/Identity-Contract lesen
- darf Issues lesen
- darf Events lesen
- darf OBS-Status lesen
- darf Browserquellen lesen
- darf Szenen lesen
- darf keine POST /api/overlay-monitor/obs-source/action Route aufrufen
- darf keinen Browserquellen-Refresh auslösen
- darf keinen Cache-Refresh auslösen
- darf keine Source show/hide/toggle/cycle/restart Aktion auslösen
- darf keine automatische Recovery auslösen
- darf keine OBS-Reparatur auslösen
- darf keine Queue-/Sound-/Alert-Aktion auslösen
- darf keine DB-Migration auslösen
- darf keine Twitch-/Chat-/Discord-Nachricht posten
```

## Möglicher Folge-Step

```text
CAN-39.3 - Overlay-Monitor Übersicht optisch vereinfachen / produktive Aktionen klarer markieren
```

Möglicher Inhalt:

```text
- keine Backend-Änderung
- keine Reparaturaktion auslösen
- sichtbare Trennung: Read-only Diagnose vs. manuelle OBS-Aktionen
- Hinweis bei OBS-Inventar-Refresh: liest OBS und aktualisiert Cache
- produktive Reparaturbuttons optisch klar als manuell markieren
```

## Stand

```text
CAN-39.2: Doku-/Regelstand erstellt.
```
