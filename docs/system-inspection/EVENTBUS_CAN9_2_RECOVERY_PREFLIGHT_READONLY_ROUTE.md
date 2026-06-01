# EVENTBUS CAN-9.2 RECOVERY-PREFLIGHT READ-ONLY ROUTE

Stand: 2026-06-01
Status: umgesetzt / read-only / keine Recovery-Ausfuehrung

## Ziel

CAN-9.2 ergaenzt im bestehenden Modul `backend/modules/bus_diagnostics.js` eine eigene read-only Route fuer den Recovery-Preflight.

```text
GET /api/bus-diagnostics/recovery-preflight
```

Die Route liefert nur bereits diagnostische Preflight-Daten aus dem bestehenden Statusaufbau. Sie fuehrt keine Aktion aus und beruehrt keine Queue, keinen Sound, keinen Alert und kein Overlay.

## Technische Grenze

Geaendert wurde nur:

```text
backend/modules/bus_diagnostics.js
```

Nicht geaendert:

```text
Keine POST-Route
Keine Command-Route
Keine Prepare-Route
Keine Execute-Route
Keine Dashboard-Datei
Keine Config
Keine DB
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
```

## Version

```text
bus_diagnostics: 1.2.8
Build: STEP_CAN9_2
```

## Neue Route

```text
GET /api/bus-diagnostics/recovery-preflight
GET /api/bus-diagnostics/recovery-preflight?check=1
```

`check=1` startet nur den gleichen read-only Diagnoseabruf wie `/check`. Es gibt keine produktive Aktion.

## Response-Kernfelder

```text
ok
module
version
statusApiVersion
feature = recovery_preflight
routeVersion = CAN-9.2
mode = read_only_preflight_route
readOnly = true
canPrepare = false
canExecute = false
routeSafety
summary
recoveryPreflight
recoveryReadiness
recoveryStrategyState
warnings
optionalInfo
errors
```

## Safety-Regeln

Die Route muss immer melden:

```text
readOnly = true
automationEnabled = false
productiveActions = false
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
overlayTouched = false
canPrepare = false
canExecute = false
```

## Test

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-preflight"
$r | Select-Object module,version,feature,routeVersion,mode,readOnly,canPrepare,canExecute
$r.routeSafety | Select-Object method,readOnly,commandRoute,executeRoute,prepareRoute,recoveryExecution
$r.summary | Select-Object recoveryPreflightStatus,recoveryPreflightCheckCount,recoveryPreflightBlockingCheckCount,recoveryPreflightWarningCheckCount,recoveryPreflightNextStep
$r.recoveryPreflight.checkSummary | Select-Object total,ok,warnings,blocking,blocked
```

## Naechster Schritt

```text
CAN-9.3: Recovery-Preflight Route Live-Test und Abnahme dokumentieren
```
