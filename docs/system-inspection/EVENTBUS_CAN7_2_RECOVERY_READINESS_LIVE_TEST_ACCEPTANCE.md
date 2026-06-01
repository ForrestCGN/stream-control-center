# EVENTBUS CAN-7.2 RECOVERY READINESS LIVE-TEST UND ABNAHMEGRENZE

Stand: 2026-06-01
Status: Test-/Abnahmeplan / keine Umsetzung

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
node -c backend\modulesus_diagnostics.js
~~~

### Status kurz prüfen

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s | Select-Object ok,module,version,statusApiVersion,readOnly,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
~~~

### Recovery-Readiness prüfen

~~~powershell
$s.recoveryReadiness | Select-Object enabled,mode,ready,stage,nextStep,canProceedToDashboard,requiresExplicitGo
~~~

### Sicherheitsflags prüfen

~~~powershell
$s.recoveryReadiness.safety | Select-Object readOnly,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched,automationEnabled,productiveActions
~~~

### Blockierte Aktionen prüfen

~~~powershell
$s.recoveryReadiness.blockedActions
~~~

### Check-Route prüfen

~~~powershell
$c = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check"
$c.recoveryReadiness | Select-Object enabled,mode,ready,stage,nextStep,canProceedToDashboard,requiresExplicitGo
~~~

## Erwartetes Ergebnis

~~~text
version = 1.2.5
readOnly = True
flowTouched = False
queueTouched = False
soundSystemTouched = False
alertSystemTouched = False
overlayTouched = False
recoveryReadiness.mode = read_only
recoveryReadiness.requiresExplicitGo = True
~~~

## Harte Abnahmekriterien

CAN-7.2 gilt nur als bestanden, wenn:

~~~text
node -c besteht
/api/bus-diagnostics/status antwortet
/api/bus-diagnostics/check antwortet
version ist 1.2.5
recoveryReadiness ist vorhanden
alle produktiven Touch-Flags bleiben false
blockedActions enthalten weiterhin keine erlaubte Replay-/Auto-Recovery-Freigabe
~~~

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

CAN-7.3 darf erst nach erfolgreicher CAN-7.2-Abnahme geplant werden.

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
