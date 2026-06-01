# NEXT_STEPS

## Naechster Schritt

CAN-9.5: Recovery-Preflight Route-Kontext / NextStep Live-Test abnehmen und dokumentieren.

## Erwartete Pruefung

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-preflight"
$r | Select-Object module,version,feature,routeVersion,mode,readOnly,currentStep,nextAllowedStep,canPrepare,canExecute
$r.routeContext | Select-Object currentStep,nextAllowedStep,sourcePreflightCurrentStep,sourcePreflightNextAllowedStep,sourceReadinessCurrentStep,sourceReadinessNextAllowedStep,routeOnly,readOnly
$r.summary | Select-Object recoveryPreflightStatus,recoveryPreflightCheckCount,recoveryPreflightBlockingCheckCount,recoveryPreflightWarningCheckCount,recoveryPreflightSourceNextStep,recoveryPreflightNextStep
$r.routeSafety | Select-Object method,readOnly,commandRoute,executeRoute,prepareRoute,recoveryExecution
```
