# CURRENT CHAT HANDOFF – CAN-7.0 Real File Inspection

Stand: 2026-06-01

## Kurzstatus

CAN-6.x ist als reine Planungs- und Sicherheitsreihe abgeschlossen.

CAN-7.0 hat die echten relevanten Dateien aus GitHub/dev geprueft und die erste technische Umsetzungsgrenze fuer CAN-7.1 definiert.

## Gepruefte Dateien

~~~text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
backend/modules/alert_system.js
backend/modules/sound_system.js
htdocs/dashboard/modules/bus_diagnostics.js
~~~

## Wichtigste Feststellungen

~~~text
bus_diagnostics.js: Version 1.2.4, read-only Diagnose.
communication_bus.js: Version 0.8.3, ersetzt keine produktiven Alert/Sound-Flows.
alert_system.js: Version 3.1.9, additive read-only visual delivery diagnostics, runtime flow unchanged.
sound_system.js: Version 0.1.20, soundBusCommand dry_run mit allowQueueTouch=false und allowAudioTouch=false.
dashboard bus_diagnostics.js: Recovery-Tab ist Anzeige, keine Recovery-Aktion.
~~~

## Weiterhin blockiert

~~~text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
Queue-/Sound-/Alert-/Overlay-Beruehrung
Dashboard-Recovery-Buttons
Simulation-Buttons
DB-/Config-Migration
~~~

## Erlaubte CAN-7.1 Grenze

~~~text
Nur backend/modules/bus_diagnostics.js.
Nur additive read-only Felder.
Vorgeschlagenes Objekt: recoveryReadiness.
Keine neue produktive Route.
Keine POST-/Command-Route.
Keine Ausfuehrung.
Keine Buttons.
~~~

## Tests fuer CAN-7.1

~~~powershell
node -c backend\modules\bus_diagnostics.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/status"
$s | Select-Object ok,module,version,readOnly,flowTouched,queueTouched,soundSystemTouched,alertSystemTouched,overlayTouched

$s.recoveryReadiness | ConvertTo-Json -Depth 8
$s.recoveryStrategyState | Select-Object mode,state,severity,readOnly,automationEnabled
~~~

## Arbeitsregel

Vor CAN-7.1 wieder Ziel/Datei/Aenderung/Nicht geaendert/Tests nennen und auf Go warten.
