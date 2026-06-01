# EVENTBUS CAN-8.7 – Recovery-Preflight Check-Matrix Plan

Stand: 2026-06-01
Status: Planung / keine Umsetzung
Marker: STEP_CAN8_7_RECOVERY_PREFLIGHT_CHECK_MATRIX_PLAN

## Ziel

CAN-8.7 definiert die spaetere read-only Check-Matrix fuer `recoveryPreflight`.

Dieser Step setzt noch keinen Code um.

## Ausgangslage

Aktuell stabil:

~~~text
CAN-8.3: `recoveryPreflight` wird vom Backend read-only geliefert.
CAN-8.5: `recoveryPreflight` wird im Dashboard angezeigt.
CAN-8.5.1: Preflight-Untertab-Klick funktioniert.
CAN-8.6: Dashboard-Anzeige live abgenommen.
~~~

Aktueller bekannter Dashboard-Hinweis:

~~~text
Preflight-Checks: Noch keine Recovery-Preflight-Checks geladen.
Preflight-Scope: Kein Preflight-Scope gemeldet.
~~~

Das ist aktuell korrekt, weil noch keine echte Preflight-Check-Matrix existiert.

## Grundregel

Die Check-Matrix bleibt in der naechsten technischen Phase read-only.

~~~text
Keine Prepare-Ausfuehrung
Keine Execute-Ausfuehrung
Keine POST-/Command-Route
Keine Queue-Aenderung
Keine Sound-Aenderung
Keine Alert-Aenderung
Keine Overlay-Steuerung
Keine DB-Migration
~~~

## Geplante Matrix-Struktur

Das spaetere Feld bleibt Teil von `recoveryPreflight`.

Geplanter Bereich:

~~~text
recoveryPreflight.checks[]
~~~

Jeder Check soll mindestens enthalten:

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

## Kategorien

Geplante Kategorien:

~~~text
core
safety
readiness
correlation
queue
sound
alert
overlay
dashboard
audit
route_boundary
~~~

## Check-Kandidaten

### Core

~~~text
preflight_status_available
recovery_readiness_available
bus_diagnostics_status_available
communication_bus_available
~~~

Diese Checks pruefen nur, ob die benoetigten Statusdaten vorhanden sind.

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

Diese Checks sind Pflicht fuer jede spaetere Preflight-Stufe.

### Readiness

~~~text
recovery_readiness_ready
recovery_readiness_no_blockers
recovery_readiness_allows_dashboard_display
~~~

Diese Checks bestaetigen den CAN-7.x Stand.

### Correlation

~~~text
correlation_status_available
correlation_no_errors
correlation_unmatched_count_known
visual_delivery_state_known
~~~

Diese Checks duerfen keine Reparatur ausloesen.

### Queue / Sound / Alert / Overlay

~~~text
sound_status_available
sound_no_active_blocking_error
alert_status_available
alert_no_active_blocking_error
overlay_client_state_known
overlay_monitor_state_known
~~~

Diese Checks duerfen nur anzeigen, nicht korrigieren.

### Dashboard

~~~text
dashboard_display_only
dashboard_no_recovery_buttons
dashboard_no_simulation_buttons
dashboard_no_prepare_execute_buttons
~~~

Diese Checks sind vorerst nur dokumentierte Erwartung. Ein spaeterer technischer Dashboard-Selfcheck muss separat geplant werden.

### Audit / Route Boundary

~~~text
audit_not_required_for_readonly_status
no_post_command_route
no_prepare_route
no_execute_route
manual_execution_hard_blocked
~~~

Diese Checks sichern die Grenze zu spaeteren CAN-9/CAN-10 Schritten.

## Severity-Regeln

Geplante Severity-Werte:

~~~text
ok       -> Check bestanden
info     -> nur Hinweis, kein Blocker
warning  -> pruefen, aber keine Aktion ausloesen
blocked  -> spaeteres Prepare/Execute darf nicht angeboten werden
error    -> Diagnose unvollstaendig oder Sicherheitsgrenze verletzt
~~~

## Blocking-Regel

Ein Check blockiert spaetere Prepare-/Execute-Stufen, wenn:

~~~text
blocking = true
severity in [blocked, error]
ok = false
~~~

In CAN-8.x bleibt das nur Anzeige. Es wird daraus keine Aktion gestartet.

## Geplante Summary-Felder

Spaeter in `summary` ergaenzen:

~~~text
recoveryPreflightCheckCount
recoveryPreflightCheckOkCount
recoveryPreflightCheckWarningCount
recoveryPreflightCheckBlockedCount
recoveryPreflightCheckErrorCount
recoveryPreflightHasBlockingChecks
~~~

## Dashboard-Anzeige spaeter

Der bestehende Preflight-Untertab soll spaeter die Checks nach Kategorie gruppiert anzeigen.

Wichtig:

~~~text
Nur Anzeige
Keine Buttons
Keine Links auf POST-/Command-Routen
Keine Auto-Ausfuehrung
Keine Simulation-Trigger
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
CAN-8.8: Recovery-Preflight Check-Matrix read-only Statusfelder planen
~~~

CAN-8.8 soll festlegen, welche Minimal-Checks in `backend/modules/bus_diagnostics.js` in einem spaeteren Code-Step additiv erzeugt werden duerfen.
