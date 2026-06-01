## Nach STEP CAN-9.2

Marker: STEP_CAN9_2_NEXT_STEPS

Naechster sinnvoller Schritt:

```text
CAN-9.3: Recovery-Preflight Route Live-Test und Abnahme dokumentieren
```

Zu testen:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-preflight"
$r | Select-Object module,version,feature,routeVersion,mode,readOnly,canPrepare,canExecute
$r.routeSafety | Select-Object method,readOnly,commandRoute,executeRoute,prepareRoute,recoveryExecution
$r.recoveryPreflight.checkSummary | Select-Object total,ok,warnings,blocking,blocked
```
