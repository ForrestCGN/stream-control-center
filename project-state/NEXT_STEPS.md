## Nach STEP CAN-9.1

Marker: STEP_CAN9_1_NEXT_STEPS

Naechster sinnvoller Arbeitsblock:

~~~text
CAN-9.2: Recovery-Preflight GET-Route minimal read-only planen oder umsetzen.
~~~

Erlaubte Maximalgrenze fuer CAN-9.2:

~~~text
Nur backend/modules/bus_diagnostics.js
Nur GET /api/bus-diagnostics/recovery-preflight
Nur read-only Ausgabe vorhandener recoveryPreflight-Daten
Keine POST-/Command-Route
Keine Recovery-Ausfuehrung
Keine Dashboard-Aktionsbuttons
Keine produktive Flow-Aenderung
~~~

Vor CAN-9.2 Code-Step pruefen:

~~~text
backend/modules/bus_diagnostics.js
~~~

Tests fuer spaeteren Code-Step:

~~~powershell
$p = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-preflight"
$p | Select-Object ok,module,version,feature,mode,readOnly,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
$p.recoveryPreflight | Select-Object status,mode,readOnly,canPrepare,canExecute,currentStep,nextAllowedStep
$p.recoveryPreflight.checkSummary | Select-Object total,ok,warnings,blocking,blocked
~~~
