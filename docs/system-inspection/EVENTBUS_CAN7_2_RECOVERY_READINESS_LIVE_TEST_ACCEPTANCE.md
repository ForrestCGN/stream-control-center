# EVENTBUS CAN-7.2 RECOVERY READINESS LIVE-TEST UND ABNAHMEGRENZE

Stand: 2026-06-01
Status: Live-Test abgenommen / Doku korrigiert durch CAN-7.2.1

## Zweck

CAN-7.2 legt fest, wie die in CAN-7.1 ergänzten `recoveryReadiness`-Statusfelder geprüft und abgenommen werden.

Dieser Step ist bewusst kein weiterer Code-Step.

## Ausgangslage

CAN-7.1 hat ausschließlich `backend/modules/bus_diagnostics.js` geändert.

Erlaubte Änderung in CAN-7.1:

~~~text
Additives read-only Feld: recoveryReadiness
Version bus_diagnostics: 1.2.4 -> 1.2.5
Build: STEP_CAN7_1
Keine neue Route
Keine Command-Route
Keine Dashboard-Datei
Keine produktive Flow-Änderung
~~~

## CAN-7.2 Live-Test-Ziel

Es soll geprüft werden, ob die bestehenden Bus-Diagnostics-Routen weiterhin funktionieren und die neue Readiness-Ausgabe sichtbar ist.

Zu prüfen sind nur bestehende GET-Routen:

~~~text
/api/bus-diagnostics/status
/api/bus-diagnostics/check
/api/bus-diagnostics/recovery-simulation/status
/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck
~~~

## PowerShell-Testbefehle

### Syntax

~~~powershell
node -c backend\modules\bus_diagnostics.js
~~~

### Status kurz prüfen

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s | Select-Object ok,module,version,statusApiVersion,feature,mode,readOnly
~~~

### Recovery-Readiness prüfen

~~~powershell
$s.recoveryReadiness | Select-Object status,canStartReadOnlyCode,readOnly,currentStep,nextAllowedStep
~~~

### Sicherheitsflags prüfen

~~~powershell
$s.recoveryReadiness | Select-Object automationEnabled,productiveActions,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
~~~

### Summary-Felder prüfen

~~~powershell
$s.summary | Select-Object recoveryReadinessStatus,recoveryReadinessCanStartReadOnlyCode,recoveryReadinessNextStep
~~~

### Detailausgabe nur bei Bedarf

~~~powershell
$s.recoveryReadiness | ConvertTo-Json -Depth 10
~~~

### Blockierte Aktionen prüfen

~~~powershell
$s.recoveryReadiness.hardBlockedActions
~~~

### Check-Route prüfen

~~~powershell
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check"
$c.recoveryReadiness | Select-Object status,canStartReadOnlyCode,readOnly,currentStep,nextAllowedStep
~~~

## Tatsächlich getestetes Ergebnis

Forrest hat den Live-Test am 2026-06-01 ausgeführt.

Bestätigte Statuswerte:

~~~text
module = bus_diagnostics
version = 1.2.5
statusApiVersion = 1.0.0
feature = bus_dashboard_diagnostics
mode = read_only_dashboard_preparation
readOnly = True
~~~

Bestätigte Recovery-Readiness-Werte:

~~~text
status = ready
canStartReadOnlyCode = True
readOnly = True
currentStep = CAN-7.1
nextAllowedStep = CAN-7.2_read_only_dashboard_display_planning
~~~

Bestätigte Sicherheitsflags:

~~~text
automationEnabled = False
productiveActions = False
flowTouched = False
queueTouched = False
soundSystemTouched = False
alertSystemTouched = False
overlayTouched = False
~~~

Bestätigte Summary-Werte:

~~~text
recoveryReadinessStatus = ready
recoveryReadinessCanStartReadOnlyCode = True
recoveryReadinessNextStep = CAN-7.2_read_only_dashboard_display_planning
~~~

## Harte Abnahmekriterien

CAN-7.2 gilt als bestanden, wenn:

~~~text
node -c besteht
/api/bus-diagnostics/status antwortet
/api/bus-diagnostics/check antwortet
version ist 1.2.5
recoveryReadiness ist vorhanden
recoveryReadiness.status ist ready
recoveryReadiness.canStartReadOnlyCode ist true
alle produktiven Touch-Flags bleiben false
hardBlockedActions enthalten weiterhin keine erlaubte Replay-/Auto-Recovery-Freigabe
~~~

Stand nach Live-Test: bestanden.

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

## Grenze für CAN-7.3

CAN-7.3 darf nach erfolgreicher CAN-7.2-Abnahme geplant werden.

Erste sinnvolle CAN-7.3-Grenze:

~~~text
Nur htdocs/dashboard/modules/bus_diagnostics.js
Nur read-only Anzeige von recoveryReadiness
Keine Buttons
Keine POSTs
Keine Commands
Keine Recovery-Auslösung
~~~

Wichtig: Für CAN-7.3 muss vor Umsetzung die vollständige echte Datei `htdocs/dashboard/modules/bus_diagnostics.js` bereitliegen. Wenn GitHub-Ausgabe gekürzt ist, muss die Datei konkret angefordert werden.
