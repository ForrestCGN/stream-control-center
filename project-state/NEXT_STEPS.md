## Nach STEP CAN-9.3

Marker: STEP_CAN9_3_NEXT_STEPS

Naechster sinnvoller Arbeitsblock:

```text
CAN-9.4: Route-Kontext/NextStep read-only bereinigen und dokumentieren.
```

Moegliche Maximalgrenze fuer CAN-9.4:

```text
Nur backend/modules/bus_diagnostics.js
Nur read-only Route-Kontext/NextStep-Felder der bestehenden GET-Route
Keine POST-/Command-/Prepare-/Execute-Route
Keine Recovery-Ausfuehrung
Keine Dashboard-Aktionsbuttons
Keine produktive Flow-Aenderung
```

Ausgangslage:

```text
GET /api/bus-diagnostics/recovery-preflight funktioniert.
Route ist read-only.
RouteSafety ist sauber.
Check-Matrix ist sauber.
summary.recoveryPreflightNextStep zeigt noch historischen CAN-8.10 Wert.
```

Testziel fuer CAN-9.4, falls umgesetzt:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-preflight"
$r | Select-Object routeVersion,mode,readOnly,canPrepare,canExecute,nextAllowedStep
$r.routeSafety | Select-Object method,readOnly,commandRoute,executeRoute,prepareRoute,recoveryExecution
$r.summary | Select-Object recoveryPreflightStatus,recoveryPreflightCheckCount,recoveryPreflightBlockingCheckCount,recoveryPreflightWarningCheckCount,recoveryPreflightNextStep
```
