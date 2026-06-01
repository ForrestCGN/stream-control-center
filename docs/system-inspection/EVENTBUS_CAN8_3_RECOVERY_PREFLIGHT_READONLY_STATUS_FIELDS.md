# EVENTBUS CAN-8.3 RECOVERY PREFLIGHT READ-ONLY STATUSFELDER

Stand: 2026-06-01
Status: umgesetzt / Backend read-only / keine Recovery-Ausfuehrung

## Ziel

CAN-8.3 setzt die in CAN-8.2 geplanten `recoveryPreflight`-Statusfelder minimal und additiv in `backend/modules/bus_diagnostics.js` um.

## Geaendert

~~~text
backend/modules/bus_diagnostics.js
~~~

## Technische Aenderung

~~~text
Version: 1.2.5 -> 1.2.6
Build: STEP_CAN7_1 -> STEP_CAN8_3
Neues read-only Feld: recoveryPreflight
Neue Summary-Felder:
- recoveryPreflightStatus
- recoveryPreflightCanPrepare
- recoveryPreflightCanExecute
- recoveryPreflightNextStep
~~~

`recoveryPreflight` wird in `/api/bus-diagnostics/status` und `/api/bus-diagnostics/check` ausgegeben.

## Read-only-Garantie

CAN-8.3 setzt bewusst:

~~~text
mode = read_only
readOnly = true
canPrepare = false
canExecute = false
requiresExplicitGo = true
requestedAction = none
actionClass = diagnostic_only
~~~

Die Safety-Felder bleiben hart auf produktiv ungefaehrlich:

~~~text
automationEnabled = false
productiveActions = false
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
overlayTouched = false
~~~

## Hart blockiert

Weiterhin hart blockiert:

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
manual_recovery_execution
manual_unlock_stale_bundle
clear_stale_visual_wait
refresh_overlay_state
~~~

## Nicht geaendert

~~~text
Keine neue API-Route
Keine POST-/Command-Route
Keine Dashboard-Datei
Keine Overlay-Datei
Keine Config-Datei
Keine DB-Datei
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
~~~

## Tests

Syntax-Test:

~~~cmd
node -c backend\modulesus_diagnostics.js
~~~

Live-Test nach Backend-Neustart:

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryPreflight | Select-Object status,mode,readOnly,canPrepare,canExecute,currentStep,nextAllowedStep
$s.recoveryPreflight.safety | Select-Object automationEnabled,productiveActions,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
$s.summary | Select-Object recoveryPreflightStatus,recoveryPreflightCanPrepare,recoveryPreflightCanExecute,recoveryPreflightNextStep
~~~

## Naechster Schritt

~~~text
CAN-8.4: Recovery-Preflight read-only Live-Test und Dashboard-Anzeigegrenze dokumentieren.
~~~
