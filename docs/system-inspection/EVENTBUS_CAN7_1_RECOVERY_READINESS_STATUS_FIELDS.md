# EVENTBUS CAN-7.1 RECOVERY-READINESS STATUS-FELDER

Stand: 2026-06-01
Status: Umsetzung / read-only / additive Backend-Diagnose
Marker: STEP_CAN7_1_RECOVERY_READINESS_STATUS_FIELDS

## Ziel

CAN-7.1 ergaenzt in `backend/modules/bus_diagnostics.js` einen rein lesenden `recoveryReadiness`-Block fuer die bestehende Status- und Check-Ausgabe.

Der Step bleibt innerhalb der in CAN-7.0 definierten Grenze:

~~~text
Nur backend/modules/bus_diagnostics.js
Nur additive read-only Statusfelder
Keine neue API-Route
Keine POST-/Command-Route
Keine Recovery-Ausfuehrung
Keine Dashboard-Buttons
Keine DB-/Config-Migration
Keine produktive Flow-Aenderung
~~~

## Geaenderte Datei

~~~text
backend/modules/bus_diagnostics.js
~~~

## Technische Aenderung

- Modulversion von `1.2.4` auf `1.2.5` erhoeht.
- Build-Marker von `STEP_CAN5_5` auf `STEP_CAN7_1` gesetzt.
- Modulbeschreibung um Recovery-Readiness erweitert.
- `buildStatus()` gibt zusaetzlich `recoveryReadiness` aus.
- `analyze()` baut den Readiness-Block aus vorhandenen Diagnosewerten.
- Neue Helper:
  - `buildRecoveryReadiness(input)`
  - `addReadinessCheck(checks, blockers, input)`

## Neues Statusfeld

~~~text
recoveryReadiness
~~~

Wichtige Felder:

~~~text
ok
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
notes
checks
source
checkedAt
~~~

## Read-only Garantie

Der neue Block wird nur aus bereits vorhandenen Diagnosequellen abgeleitet:

~~~text
errors
warnings
recoveryStrategyState
resilienceMatrix
communicationBody
soundStatusBody
alertStatusBody
correlationBody
~~~

Es wird nichts gestartet, geloescht, wiederholt, bestaetigt oder veraendert.

## Hart blockiert

CAN-7.1 meldet weiterhin diese spaeteren Aktionen als hart blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
manual_recovery_execution
~~~

## Keine produktive Beruehrung

Der neue Readiness-Block setzt explizit:

~~~text
readOnly: true
automationEnabled: false
productiveActions: false
flowTouched: false
queueTouched: false
soundSystemTouched: false
alertSystemTouched: false
overlayTouched: false
~~~

## Nicht geaendert

~~~text
Keine neuen Routen
Keine POST-Routen
Keine Command-Routen
Keine Dashboard-Dateien
Keine Overlay-Dateien
Keine Config-Dateien
Keine DB-Dateien
Keine Alert-/Sound-/Overlay-Wiederholung
Keine Queue-Manipulation
Keine Recovery-Ausfuehrung
~~~

## Tests

Syntax:

~~~cmd
node -c backend\modulesus_diagnostics.js
~~~

Gezielter API-Test nach Backend-Neustart:

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s | Select-Object ok,module,version,readOnly,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
$s.recoveryReadiness | Select-Object ok,status,canStartReadOnlyCode,readOnly,automationEnabled,productiveActions,currentStep,nextAllowedStep
$s.recoveryReadiness.hardBlockedActions
~~~

Erwartung:

~~~text
version = 1.2.5
readOnly = True
automationEnabled = False
productiveActions = False
flowTouched = False
queueTouched = False
soundSystemTouched = False
alertSystemTouched = False
overlayTouched = False
~~~

## Naechster sinnvoller Schritt

~~~text
CAN-7.2: Dashboard-Anzeige fuer recoveryReadiness planen/umsetzen, weiterhin nur Anzeige und ohne Buttons.
~~~
