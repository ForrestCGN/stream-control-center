# CURRENT CHAT HANDOFF – CAN-7.2 Recovery-Readiness Live-Test

Stand: 2026-06-01

## Kurzstatus

CAN-7.1 hat `backend/modules/bus_diagnostics.js` additiv erweitert.

Aktueller Stand:

~~~text
bus_diagnostics Version: 1.2.5
Build: STEP_CAN7_1
Neues Feld: recoveryReadiness
Modus: read_only
Keine neue Route
Keine produktive Flow-Änderung
~~~

## CAN-7.2 Ergebnis

CAN-7.2 ist ein Test-/Abnahmeplan für CAN-7.1.

Geändert wurde nur Doku/Projekt-State.

CAN-7.2.1 hat anschließend die Testfelder korrigiert und den echten Live-Test als bestanden dokumentiert.

## Korrigierte Tests

~~~powershell
node -c backend\modules\bus_diagnostics.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryReadiness | Select-Object status,canStartReadOnlyCode,readOnly,currentStep,nextAllowedStep
$s.recoveryReadiness | Select-Object automationEnabled,productiveActions,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
$s.summary | Select-Object recoveryReadinessStatus,recoveryReadinessCanStartReadOnlyCode,recoveryReadinessNextStep
~~~

## Live bestätigt

~~~text
status = ready
canStartReadOnlyCode = True
readOnly = True
currentStep = CAN-7.1
nextAllowedStep = CAN-7.2_read_only_dashboard_display_planning
automationEnabled = False
productiveActions = False
flowTouched = False
queueTouched = False
soundSystemTouched = False
alertSystemTouched = False
overlayTouched = False
~~~

## Weiterhin verboten

~~~text
Keine Recovery-Buttons
Keine Simulation-Buttons
Keine Auto-Recovery
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine POST-/Command-Route
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-7.3: Dashboard-Read-only-Anzeige von recoveryReadiness planen/umsetzen
~~~

Voraussetzung: vollständige echte Datei `htdocs/dashboard/modules/bus_diagnostics.js` prüfen oder von Forrest anfordern.
