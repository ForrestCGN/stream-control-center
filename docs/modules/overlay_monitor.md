# Overlay Monitor Modul

## Kurzbeschreibung

Das Modul `overlay_monitor` stellt eine read-only Overlay-/Browserquellen-Überwachung auf Basis des bestehenden Communication Bus bereit.

Die echte Backend-Datei heißt:

```text
backend/modules/overlay_monitor.js
```

Das Modul überwacht:

- Overlay-Clients im Communication Bus
- Heartbeat-/Online-/Stale-/Offline-/Dead-Status
- erwartete Inaktivität / erwartete Idle-Zustände
- OBS-Szenen-/Browserquellen-Inventar
- Scene-Awareness
- persistierte Monitoring-Issues
- Overlay-Client-Klassifizierung
- Identity-Contract-Empfehlungen

## Modulstand

- Backend-Datei: `backend/modules/overlay_monitor.js`
- Modulname: `overlay_monitor`
- Registry-Key: `overlay_monitor`
- Modulversion: `0.1.9`
- Build: `diagnostics-standard`
- Status-API-Version: `1.0.9`
- Hauptprefix: `/api/overlay-monitor`

## Diagnose-Status CAN-43.13

CAN-43.13 hat das Modul per Batch-Export nach dem neuen Diagnose-/Registry-Standard geprüft.

Ergebnis:

- Statusroute vorhanden.
- `diagnostics`-Block vorhanden.
- Client-Control-Routen vorhanden.
- Issues-Route vorhanden.
- OBS-Inventar-Route vorhanden.
- Events-/Routes-Routen vorhanden.
- Registry-Coverage sauber.
- Live-Status sauber.
- Keine aktiven Issues.
- Keine Diagnostics-Warnings/Errors.
- Keine Codeänderung nötig.

## Wichtige Read-only Routen

- `GET /api/overlay-monitor/status`
- `GET /api/overlay-monitor/client-control/status`
- `GET /api/overlay-monitor/client-control/classification`
- `GET /api/overlay-monitor/client-control/identity-contract`
- `GET /api/overlay-monitor/issues`
- `GET /api/overlay-monitor/obs-inventory`
- `GET /api/overlay-monitor/events`
- `GET /api/overlay-monitor/routes`

## Produktive / manuelle Route

Diese Route ist manuell und kann OBS-State verändern. Sie wurde im CAN-43.13 Review nicht ausgelöst:

- `POST /api/overlay-monitor/obs-source/action`

Mögliche Aktionen laut Modul:

- Browserquelle refresh/reload
- Browserquelle refresh-cache/nocache
- Source show/enable
- Source hide/disable
- Source toggle
- Source cycle/restart/hide-show

## Bestätigte Live-Werte CAN-43.13

```text
ok=True
module=overlay_monitor
moduleVersion=0.1.9
moduleBuild=diagnostics-standard
version=0.1.9
diagnosticVersion=0.1.9
statusApiVersion=1.0.9
feature=overlay_monitor_read_only
readOnly=True
overlayTouched=False
obsTouched=False
refreshTouched=False
routeCount=9
```

```text
summary:
total=10
online=7
expectedInactive=1
expectedIdle=2
expectedNotActive=3
withHeartbeat=10
connected=10
withErrors=0
status=ok
```

```text
diagnostics:
ok=True
health=ok
module=overlay_monitor
version=0.1.9
build=diagnostics-standard
schemaVersion=1
schemaReady=True
warnings=[]
errors=[]
lastError=
```

```text
issues:
active=0
resolved=4262
total=4262
```

```text
obs inventory:
sceneCount=18
sourceCount=111
summary.sources=111
summary.visible=89
summary.cgn=80
summary.external=24
summary.placeholder=7
summary.warnings=8
```

## Hinweise

- `inventory.summary.warnings=8` sind Inventar-/Source-Klassifizierungen, keine aktiven Diagnostics-Fehler.
- `obsRepairActions=0`.
- Keine Funktionalität entfernen.
- Manuelle OBS-Reparaturen nur bewusst und gezielt testen.
- Doku/project-state bei Änderungen aktualisieren.
