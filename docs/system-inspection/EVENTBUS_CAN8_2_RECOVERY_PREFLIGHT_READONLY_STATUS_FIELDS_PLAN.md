# EVENTBUS CAN-8.2 RECOVERY PREFLIGHT READ-ONLY STATUSFELDER PLAN

Stand: 2026-06-01
Status: Planung / Backend-Grenze / keine technische Umsetzung

## Ausgangslage

CAN-8.1 hat das geplante read-only Datenmodell `recoveryPreflight` definiert.

Bestaetigter Stand:

~~~text
Recovery-Readiness ist backendseitig read-only vorhanden.
Recovery-Readiness ist im Dashboard read-only sichtbar.
Recovery-Tab ist aufgeraeumt.
CAN-8.1 definiert das Preflight-Datenmodell nur als Planung.
~~~

## Ziel von CAN-8.2

CAN-8.2 legt fest, welche read-only Statusfelder spaeter technisch in `backend/modules/bus_diagnostics.js` ergaenzt werden duerfen.

CAN-8.2 baut noch keinen Code.

## Betroffene Datei fuer spaeteren CAN-8.3-Code-Step

~~~text
backend/modules/bus_diagnostics.js
~~~

Optional spaeter fuer Anzeige:

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

## Geplantes neues Statusfeld

Spaeteres Feld in `/api/bus-diagnostics/status` und `/api/bus-diagnostics/check`:

~~~text
recoveryPreflight
~~~

## Minimal erlaubte CAN-8.3-Grenze

CAN-8.3 darf maximal additiv in `bus_diagnostics.js` ergaenzen:

~~~text
buildRecoveryPreflight(input)
recoveryPreflight: diagnostics.recoveryPreflight
summary.recoveryPreflightStatus
summary.recoveryPreflightCanExecute
summary.recoveryPreflightNextStep
~~~

Dabei muss alles read-only bleiben.

## Geplante Felder fuer `recoveryPreflight`

~~~json
{
  "ok": true,
  "status": "ready|blocked|observe|unavailable",
  "mode": "read_only",
  "readOnly": true,
  "canPrepare": false,
  "canExecute": false,
  "requiresExplicitGo": true,
  "currentStep": "CAN-8.3",
  "nextAllowedStep": "CAN-8.4_dashboard_preflight_readonly_display_planning",
  "requestedAction": "none",
  "actionClass": "diagnostic_only",
  "requiredGuards": [],
  "passedGuards": [],
  "missingGuards": [],
  "blockers": [],
  "warnings": [],
  "hardBlockedActions": [],
  "safety": {
    "automationEnabled": false,
    "productiveActions": false,
    "flowTouched": false,
    "queueTouched": false,
    "soundSystemTouched": false,
    "alertSystemTouched": false,
    "overlayTouched": false
  },
  "source": {
    "recoveryReadinessStatus": "ready|blocked|observe|unavailable",
    "recoveryStrategyState": "...",
    "recoveryStrategySeverity": "...",
    "matrixWarnings": 0,
    "matrixErrors": 0,
    "diagnosticsWarnings": 0,
    "diagnosticsErrors": 0
  },
  "checkedAt": "ISO-8601"
}
~~~

## Read-only-Regeln

Pflichtwerte fuer CAN-8.3:

~~~text
mode = read_only
readOnly = true
canExecute = false
automationEnabled = false
productiveActions = false
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
overlayTouched = false
~~~

## Aktionseinstufung fuer CAN-8.3

CAN-8.3 darf noch keine echte Aktion auswerten oder vorbereiten.

Erlaubt:

~~~text
requestedAction = none
actionClass = diagnostic_only
canPrepare = false
canExecute = false
~~~

Nicht erlaubt:

~~~text
POST-/Command-Route
Dashboard-Aktionsbutton
Recovery-Ausfuehrung
Queue-Unlock
Alert-Replay
Sound-Replay
Overlay-Retry
DB-/Config-Migration
~~~

## Hart blockierte Aktionen

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

Hinweis: `manual_unlock_stale_bundle`, `clear_stale_visual_wait` und `refresh_overlay_state` bleiben fuer CAN-8.3 blockiert, obwohl sie spaeter eventuell Low-Risk werden koennten. CAN-8.3 ist nur read-only Status.

## Summary-Felder

CAN-8.3 soll spaeter im bestehenden `summary` nur kompakte Felder ergaenzen:

~~~text
recoveryPreflightStatus
recoveryPreflightCanPrepare
recoveryPreflightCanExecute
recoveryPreflightNextStep
~~~

## Tests fuer spaeteren CAN-8.3-Code-Step

Nach spaeterer Umsetzung:

~~~cmd
node -c backend\modulesus_diagnostics.js
~~~

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryPreflight | Select-Object status,mode,readOnly,canPrepare,canExecute,currentStep,nextAllowedStep
$s.recoveryPreflight.safety | Select-Object automationEnabled,productiveActions,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
$s.summary | Select-Object recoveryPreflightStatus,recoveryPreflightCanPrepare,recoveryPreflightCanExecute,recoveryPreflightNextStep
~~~

## Nicht geaendert

CAN-8.2 aendert nichts technisch:

~~~text
Keine Backend-Datei
Keine Dashboard-Datei
Keine API-Route
Keine Config
Keine DB
Keine Recovery-Ausfuehrung
Keine produktive Flow-Aenderung
~~~

## Naechster Schritt

~~~text
CAN-8.3: Echte backend/modules/bus_diagnostics.js vollstaendig pruefen und recoveryPreflight read-only Statusfelder additiv umsetzen.
~~~
