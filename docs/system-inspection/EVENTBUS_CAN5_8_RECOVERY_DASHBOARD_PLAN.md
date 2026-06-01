# EVENTBUS CAN-5.8 RECOVERY-DIAGNOSE DASHBOARD PLAN

Stand: 2026-06-01
Status: Plan / Dashboard-Read-only-Vorbereitung

## Ausgangslage

CAN-5.5 bis CAN-5.7 bestätigen den Recovery-Simulation-Harness als stabilen read-only Diagnose-Stand.

~~~text
bus_diagnostics: 1.2.4
simulationVersion: CAN-5.5
readOnly: true
automationEnabled: false
productiveActions: false
~~~

Die geprüften Szenarien wurden korrekt erkannt:

~~~text
missingAck -> blocked_missing_visual_ack
noClient   -> blocked_no_overlay_client
unmatched  -> blocked_unmatched_alert_sound
~~~

## Ziel von CAN-5.8

CAN-5.8 plant, die Recovery-Diagnose im bestehenden Bus-Diagnostics-Dashboard sichtbar zu machen.

Wichtig: CAN-5.8 ist zunächst nur ein Plan. Es wird keine Dashboard-Logik geändert und keine Simulation aus der UI ausgelöst.

## Dashboard-Grundregel

~~~text
Nur read-only anzeigen.
Keine Simulation per Dashboard auslösen.
Keine Recovery-Automatik.
Kein Auto-Retry.
Kein Alert-Replay.
Kein Sound-Replay.
Keine produktive Flow-Änderung.
~~~

## Geplante Anzeige im Dashboard

Die Recovery-Diagnose soll später im bestehenden Bus-Diagnostics-Dashboard sichtbar werden, bevorzugt im Bereich `Integrationen` oder als eigener Tab `Recovery`.

Anzuzeigende Werte:

~~~text
recoveryStrategyState.mode
recoveryStrategyState.state
recoveryStrategyState.severity
recoveryStrategyState.nextAction
recoveryStrategyState.reasons
recoveryStrategyState.blockedActions
automationEnabled
productiveActions
flowTouched
queueTouched
soundSystemTouched
alertSystemTouched
overlayTouched
~~~

## Simulationsstatus anzeigen

Zusätzlich kann der Status des Simulation-Harness read-only angezeigt werden:

~~~text
/api/bus-diagnostics/recovery-simulation/status
allowedScenarios
blockedActions
readOnly
automationEnabled
productiveActions
notes
~~~

## Nicht im Dashboard auslösen

Diese Endpunkte sollen nicht über normale Dashboard-Buttons ausgelöst werden, solange UI-Schutz, Rechte, Labeling und Testmodus nicht eindeutig geklärt sind:

~~~text
/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck
/api/bus-diagnostics/recovery-simulation/test?scenario=noClient
/api/bus-diagnostics/recovery-simulation/test?scenario=unmatched
/api/bus-diagnostics/recovery-simulation/test?scenario=waitingTooLong
~~~

## UI-Schutz vor späteren Test-Buttons

Falls später doch Test-Buttons im Dashboard kommen, müssen vorher diese Regeln erfüllt sein:

~~~text
Deutliches Label: SYNTHETISCHER TEST
Keine echten Alerts/Sounds/Overlays
Keine Queue-Berührung
Keine Recovery-Route
Keine Auto-Wiederholung
Nur Owner/Admin
Audit-Log-Eintrag
Bestätigungsdialog
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-5.9: Read-only Recovery-Diagnose im Bus-Diagnostics-Dashboard anzeigen
~~~

CAN-5.9 darf nur Anzeige-Logik ergänzen, keine Simulation-Trigger und keine Recovery-Automatik.
