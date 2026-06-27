# CURRENT CHAT HANDOFF – CAN-7.2.1 Recovery-Readiness Testfeld-Fix

Stand: 2026-06-01

## Kurzstatus

CAN-7.1 ist live abgenommen.

CAN-7.2.1 korrigiert nur die Doku-Testbefehle aus CAN-7.2, weil die erste Doku nicht die realen Feldnamen der API-Antwort verwendet hatte.

## Bestätigter Live-Test

~~~text
bus_diagnostics version = 1.2.5
recoveryReadiness.status = ready
recoveryReadiness.canStartReadOnlyCode = True
recoveryReadiness.readOnly = True
recoveryReadiness.currentStep = CAN-7.1
recoveryReadiness.nextAllowedStep = CAN-7.2_read_only_dashboard_display_planning
~~~

Sicherheitsflags:

~~~text
automationEnabled = False
productiveActions = False
flowTouched = False
queueTouched = False
soundSystemTouched = False
alertSystemTouched = False
overlayTouched = False
~~~

## Korrekte Testbefehle

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryReadiness | Select-Object status,canStartReadOnlyCode,readOnly,currentStep,nextAllowedStep
$s.recoveryReadiness | Select-Object automationEnabled,productiveActions,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
$s.summary | Select-Object recoveryReadinessStatus,recoveryReadinessCanStartReadOnlyCode,recoveryReadinessNextStep
~~~

## Nächster Schritt

~~~text
CAN-7.3: Dashboard-Read-only-Anzeige von recoveryReadiness planen/umsetzen
~~~

Vor Umsetzung muss die vollständige echte Datei `htdocs/dashboard/modules/bus_diagnostics.js` geprüft werden.
