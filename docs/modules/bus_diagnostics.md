# Bus Diagnostics Modul

## Kurzbeschreibung

Das Modul `bus_diagnostics` stellt einen read-only Aggregatstatus für Communication Bus, Sound/EventBus, Alert/EventBus, VIP-Sound, Recovery-/Resilience-Checks und Preflight-Status bereit.

Die echte Backend-Datei heißt:

```text
backend/modules/bus_diagnostics.js
```

## Modulstand

- Backend-Datei: `backend/modules/bus_diagnostics.js`
- Modulname: `bus_diagnostics`
- Registry-Key: `bus_diagnostics`
- Modulversion: `1.2.9`
- Status-API-Version: `1.0.0`
- Build laut `MODULE_META`: `STEP_CAN9_4`
- Hauptprefix: `/api/bus-diagnostics`

## Diagnose-Status CAN-43.14

CAN-43.14 hat das Modul per Batch-Export nach dem neuen Diagnose-/Registry-Standard geprüft.

Ergebnis:

- Statusroute vorhanden.
- Routenübersicht vorhanden.
- Registry-Coverage sauber.
- Live-Status sauber.
- Read-only.
- Keine Systeme produktiv berührt.
- Keine Warnings.
- Keine Errors.
- Optionale Hinweise nur für nicht verbundene Debug-Clients.
- Keine Codeänderung nötig.

## Wichtige Read-only Routen

- `GET /api/bus-diagnostics/status`
- `GET /api/bus-diagnostics/check`
- `GET /api/bus-diagnostics/recovery-preflight`
- `GET /api/bus-diagnostics/routes`
- `GET /api/bus-diagnostics/recovery-simulation/status`
- `GET /api/bus-diagnostics/recovery-simulation/test?scenario=missingAck`

## Nicht vorhandene Routen aus Erst-Batch

Diese Routen wurden im Batch abgefragt, existieren aber nicht:

- `GET /api/bus-diagnostics/health`
- `GET /api/bus-diagnostics/summary`

Das ist kein Fehler, weil sie nicht in der Modul-Routenübersicht dokumentiert sind.

## Bestätigte Live-Werte CAN-43.14

```text
ok=True
module=bus_diagnostics
version=1.2.9
statusApiVersion=1.0.0
feature=bus_dashboard_diagnostics
mode=read_only_dashboard_preparation
readOnly=True
requestedCheck=False
flowTouched=False
queueTouched=False
soundSystemTouched=False
alertSystemTouched=False
vipSystemTouched=False
overlayTouched=False
summary.status=ok
warnings=[]
errors=[]
```

```text
summary:
communicationOk=True
soundBusOk=True
alertBusOk=True
correlationOk=True
vipOk=True
vipIntegrationOk=True
connectedClients=16
totalClients=16
vipOverlayConnected=True
soundErrors=0
alertErrors=0
matrixOk=True
matrixWarnings=0
matrixErrors=0
recoveryStrategyMode=read_only
recoveryReadinessStatus=ready
recoveryPreflightStatus=ready
recoveryPreflightBlockingCheckCount=0
recoveryPreflightWarningCheckCount=0
```

Optionale Hinweise:

```text
sound_eventbus_debug_not_connected_optional
alert_eventbus_debug_not_connected_optional
```

## Aggregierte Endpunkte

`bus_diagnostics` prüft intern read-only:

```text
/api/communication/status
/api/sound/eventbus/status
/api/sound/status
/api/alerts/eventbus/status
/api/alerts/status
/api/alerts/eventbus/correlation/status
/api/vip-sound/status
/api/vip-sound/integration-check
```

## Hinweise

- Keine Funktionalität entfernen.
- Dieses Modul ist ein Aggregator; es sollte keine produktiven Aktionen auslösen.
- Recovery-/Simulation-Routen sind als read-only dokumentiert.
- Doku/project-state bei Änderungen aktualisieren.
