# EVENTBUS CAN-9.4 - Recovery-Preflight Route-Kontext / NextStep Fix

## Zweck

CAN-9.4 korrigiert die Darstellung des naechsten Schritts in der dedizierten read-only Recovery-Preflight-Route.

In CAN-9.2 wurde die Route `GET /api/bus-diagnostics/recovery-preflight` eingefuehrt. Die Route war korrekt read-only, meldete jedoch im `summary.recoveryPreflightNextStep` noch den eingebetteten CAN-8.x-Preflight-NextStep aus dem internen Statusobjekt. Das war technisch nicht gefaehrlich, aber fuer die CAN-9.x-Routenabnahme missverstaendlich.

## Geaendert

Datei:

```text
backend/modules/bus_diagnostics.js
```

Aenderungen:

```text
VERSION: 1.2.8 -> 1.2.9
MODULE_META.build: STEP_CAN9_2 -> STEP_CAN9_4
GET /api/bus-diagnostics/recovery-preflight meldet routeVersion: CAN-9.4
GET /api/bus-diagnostics/recovery-preflight meldet currentStep: CAN-9.4
GET /api/bus-diagnostics/recovery-preflight meldet nextAllowedStep: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
summary.recoveryPreflightNextStep zeigt nun den CAN-9.x-Routen-NextStep
summary.recoveryPreflightSourceNextStep enthaelt weiter den eingebetteten CAN-8.x-Quell-NextStep
routeContext wurde ergaenzt
```

## Route-Kontext

Neu in der Routen-Antwort:

```json
{
  "routeContext": {
    "currentStep": "CAN-9.4",
    "nextAllowedStep": "CAN-9.5_recovery_preflight_route_context_live_test_acceptance",
    "routeVersion": "CAN-9.4",
    "mode": "read_only_preflight_route",
    "sourcePreflightCurrentStep": "CAN-8.9",
    "sourcePreflightNextAllowedStep": "CAN-8.10_preflight_check_matrix_live_test_acceptance",
    "sourceReadinessCurrentStep": "CAN-7.1",
    "sourceReadinessNextAllowedStep": "CAN-7.2_read_only_dashboard_display_planning",
    "routeOnly": true,
    "readOnly": true
  }
}
```

## Nicht geaendert

```text
Keine neue API-Route
Keine POST-Route
Keine Command-Route
Keine Execute-Route
Keine Prepare-Route
Keine Dashboard-Datei
Keine Config
Keine DB
Keine Recovery-Ausfuehrung
Keine Queue-Steuerung
Keine Sound-Steuerung
Keine Alert-Steuerung
Keine Overlay-Steuerung
Keine produktive Flow-Aenderung
```

## Erwarteter Test

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-preflight"
$r | Select-Object module,version,feature,routeVersion,mode,readOnly,currentStep,nextAllowedStep,canPrepare,canExecute
$r.routeContext | Select-Object currentStep,nextAllowedStep,sourcePreflightCurrentStep,sourcePreflightNextAllowedStep,sourceReadinessCurrentStep,sourceReadinessNextAllowedStep,routeOnly,readOnly
$r.summary | Select-Object recoveryPreflightStatus,recoveryPreflightCheckCount,recoveryPreflightBlockingCheckCount,recoveryPreflightWarningCheckCount,recoveryPreflightSourceNextStep,recoveryPreflightNextStep
$r.routeSafety | Select-Object method,readOnly,commandRoute,executeRoute,prepareRoute,recoveryExecution
```

Erwartung:

```text
version: 1.2.9
routeVersion: CAN-9.4
currentStep: CAN-9.4
nextAllowedStep: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
readOnly: True
canPrepare: False
canExecute: False
routeSafety.method: GET
routeSafety.commandRoute: False
routeSafety.executeRoute: False
routeSafety.prepareRoute: False
routeSafety.recoveryExecution: False
summary.recoveryPreflightNextStep: CAN-9.5_recovery_preflight_route_context_live_test_acceptance
summary.recoveryPreflightSourceNextStep: CAN-8.10_preflight_check_matrix_live_test_acceptance
```

## Abschluss

```cmd
node -c backend\modules\bus_diagnostics.js
.\stepdone.cmd "CAN-9.4 Recovery-Preflight Route-Kontext NextStep bereinigt"
```
