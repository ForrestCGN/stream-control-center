# EVENTBUS CAN-8.8 – Recovery-Preflight Check-Matrix Statusfelder Plan

Stand: 2026-06-01
Status: Planung / keine Umsetzung
Marker: STEP_CAN8_8_RECOVERY_PREFLIGHT_CHECK_MATRIX_STATUS_FIELDS_PLAN

## Ziel

CAN-8.8 definiert die Minimalgrenze fuer den naechsten technischen Backend-Step.

Es wird noch kein Code geaendert.

Ziel ist festzulegen, welche read-only Check-Matrix-Felder spaeter additiv in `backend/modules/bus_diagnostics.js` entstehen duerfen.

## Ausgangslage

Aktuell stabil:

~~~text
CAN-8.3: recoveryPreflight wird vom Backend read-only geliefert.
CAN-8.5: recoveryPreflight wird im Dashboard angezeigt.
CAN-8.5.1: Preflight-Untertab-Klick funktioniert.
CAN-8.6: Dashboard-Anzeige live abgenommen.
CAN-8.7: Check-Matrix konzeptionell geplant.
~~~

Aktuell zeigt das Dashboard korrekt:

~~~text
Preflight-Checks: Noch keine Recovery-Preflight-Checks geladen.
Preflight-Scope: Kein Preflight-Scope gemeldet.
~~~

CAN-8.9 darf diese Anzeige spaeter mit echten read-only Checks fuellen.

## Grundregel fuer CAN-8.9

CAN-8.9 darf nur additive Statusfelder liefern.

~~~text
Keine neue API-Route
Keine POST-/Command-Route
Keine Prepare-Route
Keine Execute-Route
Keine Recovery-Ausfuehrung
Keine Queue-Aenderung
Keine Sound-Aenderung
Keine Alert-Aenderung
Keine Overlay-Steuerung
Keine DB-/Config-Migration
~~~

## Erlaubter technischer Scope fuer CAN-8.9

Datei:

~~~text
backend/modules/bus_diagnostics.js
~~~

Erlaubte additive Felder in `recoveryPreflight`:

~~~text
checks[]
checkSummary
scope
blockers
warnings
hardBlockedActions
~~~

Erlaubte additive Felder in `summary`:

~~~text
recoveryPreflightCheckCount
recoveryPreflightCheckOkCount
recoveryPreflightCheckWarningCount
recoveryPreflightCheckBlockedCount
recoveryPreflightCheckErrorCount
recoveryPreflightHasBlockingChecks
~~~

## Minimale Check-Struktur

Jeder Check soll folgende Felder erhalten:

~~~text
key
label
category
ok
severity
blocking
reason
details
source
checkedAt
~~~

## Minimale Checks fuer CAN-8.9

CAN-8.9 soll bewusst klein bleiben und nur Checks nutzen, die aus bereits vorhandenen Daten ableitbar sind.

### Core

~~~text
preflight_status_available
recovery_readiness_available
bus_diagnostics_status_available
~~~

### Safety

~~~text
read_only_true
automation_disabled
productive_actions_disabled
flow_not_touched
queue_not_touched
sound_not_touched
alert_not_touched
overlay_not_touched
~~~

### Readiness

~~~text
recovery_readiness_ready
recovery_readiness_no_blockers
~~~

### Correlation / Matrix

~~~text
resilience_matrix_no_errors
diagnostics_errors_absent
diagnostics_warnings_known
~~~

### Route Boundary

~~~text
no_prepare_route
no_execute_route
manual_execution_hard_blocked
~~~

## Severity-Regeln fuer CAN-8.9

~~~text
ok      = bestanden
info    = Hinweis, kein Blocker
warning = sichtbar pruefen, aber CAN-8.x bleibt read-only
blocked = spaetere Prepare-/Execute-Grenze blockiert
error   = Diagnose oder Sicherheitsgrenze verletzt
~~~

## Blocking-Regel

Ein Check blockiert, wenn:

~~~text
ok = false
blocking = true
severity = blocked oder error
~~~

In CAN-8.x bleibt auch ein blockierender Check nur Anzeige.

## Geplantes `checkSummary`

~~~text
checkSummary: {
  total,
  ok,
  info,
  warning,
  blocked,
  error,
  hasBlockingChecks,
  generatedAt
}
~~~

## Geplanter `scope`

~~~text
scope: [
  "read_only_status_fields",
  "dashboard_display_only",
  "no_prepare_route",
  "no_execute_route",
  "no_recovery_execution"
]
~~~

## Hart blockierte Aktionen bleiben

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
manual_recovery_execution
prepare_recovery
execute_recovery
~~~

## Tests fuer CAN-8.9

Nach einem spaeteren CAN-8.9 Code-Step:

~~~powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s.recoveryPreflight.checkSummary | Select-Object total,ok,warning,blocked,error,hasBlockingChecks
$s.recoveryPreflight.checks | Select-Object key,category,ok,severity,blocking,reason | Format-Table -AutoSize
$s.summary | Select-Object recoveryPreflightCheckCount,recoveryPreflightCheckOkCount,recoveryPreflightCheckWarningCount,recoveryPreflightCheckBlockedCount,recoveryPreflightCheckErrorCount,recoveryPreflightHasBlockingChecks
~~~

Sicherheitspruefung:

~~~powershell
$s.recoveryPreflight.safety | Select-Object automationEnabled,productiveActions,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched
~~~

Erwartung:

~~~text
automationEnabled = False
productiveActions = False
flowTouched = False
queueTouched = False
soundSystemTouched = False
alertSystemTouched = False
overlayTouched = False
~~~

## Nicht geaendert

~~~text
Keine Backend-Datei geaendert
Keine Dashboard-Datei geaendert
Keine API-Route geaendert
Keine Config geaendert
Keine DB geaendert
Keine Recovery-Ausfuehrung aktiviert
Keine produktive Flow-Aenderung
~~~

## Naechster sinnvoller Schritt

~~~text
CAN-8.9: Recovery-Preflight Check-Matrix read-only Statusfelder im Backend umsetzen
~~~

CAN-8.9 darf nur `backend/modules/bus_diagnostics.js` additiv erweitern und muss mit `node -c backend\modules\bus_diagnostics.js` getestet werden.
