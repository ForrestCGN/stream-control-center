# EVENTBUS CAN-7.2.1 RECOVERY READINESS TEST-FELDER DOKU-FIX

Stand: 2026-06-01
Status: Doku-Fix / Live-Test-Abnahme festgehalten / keine Umsetzung

## Zweck

CAN-7.2.1 korrigiert die in CAN-7.2 genannten PowerShell-Testfelder auf die tatsächlich von `recoveryReadiness` gelieferten Felder.

Grund: Die CAN-7.2-Doku enthielt Testfelder wie `enabled`, `mode`, `ready`, `stage`, `nextStep`, `canProceedToDashboard`, `requiresExplicitGo`. Diese Felder existieren in der realen API-Antwort nicht. Die API selbst war nicht fehlerhaft; die Testanweisung war falsch.

## Bestätigter Live-Stand

Forrest hat die API live geprüft.

~~~text
module = bus_diagnostics
version = 1.2.5
readOnly = True
recoveryReadiness ist vorhanden
~~~

Die tatsächliche `recoveryReadiness`-Struktur enthält u. a.:

~~~text
status
canStartReadOnlyCode
readOnly
automationEnabled
productiveActions
flowTouched
queueTouched
soundSystemTouched
alertSystemTouched
overlayTouched
currentStep
nextAllowedStep
allowedScope
hardBlockedActions
blockers
checks
source
checkedAt
~~~

## Korrigierte Testbefehle

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryReadiness | Select-Object status,canStartReadOnlyCode,readOnly,currentStep,nextAllowedStep
$s.recoveryReadiness | Select-Object automationEnabled,productiveActions,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
$s.summary | Select-Object recoveryReadinessStatus,recoveryReadinessCanStartReadOnlyCode,recoveryReadinessNextStep
~~~

Detailprüfung nur bei Bedarf:

~~~powershell
$s.recoveryReadiness | ConvertTo-Json -Depth 10
~~~

## Tatsächlich bestätigtes Ergebnis

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
recoveryReadinessStatus = ready
recoveryReadinessCanStartReadOnlyCode = True
recoveryReadinessNextStep = CAN-7.2_read_only_dashboard_display_planning
~~~

## Abnahme

CAN-7.1 ist live abgenommen.

CAN-7.2.1 ändert nur Dokumentation und Projekt-State, damit die Testanweisungen zum echten API-Verhalten passen.

## Nicht geändert

~~~text
Keine Backend-Datei geändert
Keine Dashboard-Datei geändert
Keine API-Route ergänzt
Keine POST-/Command-Route ergänzt
Keine Config geändert
Keine DB geändert
Keine Recovery ausgeführt
Keine produktiven Flows geändert
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-7.3: Dashboard-Read-only-Anzeige von recoveryReadiness planen/umsetzen
~~~

Grenze für CAN-7.3 bleibt:

~~~text
Nur htdocs/dashboard/modules/bus_diagnostics.js
Nur Anzeige der vorhandenen recoveryReadiness-Daten
Keine Buttons
Keine POSTs
Keine Commands
Keine Recovery-Auslösung
~~~
