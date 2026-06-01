# EVENTBUS CAN-5.9 RECOVERY-DIAGNOSE DASHBOARD READ-ONLY ANZEIGE

Stand: 2026-06-01
Status: Dashboard-Anzeige / read-only

## Ausgangslage

CAN-5.8 hat geplant, die Recovery-Diagnose im bestehenden Bus-Diagnostics-Dashboard sichtbar zu machen.

CAN-5.9 ergänzt nur Anzeige-Logik im Dashboard-Modul. Es werden keine Simulationen über das Dashboard ausgelöst.

## Geänderte Datei

~~~text
htdocs/dashboard/modules/bus_diagnostics.js
~~~

## Dashboard-Erweiterung

Im Bus-Diagnostics-Dashboard wird ein neuer Tab angezeigt:

~~~text
Recovery
~~~

Der Tab zeigt read-only:

~~~text
recoveryStrategyState.mode
recoveryStrategyState.state
recoveryStrategyState.severity
recoveryStrategyState.nextAction
recoveryStrategyState.reasons
recoveryStrategyState.blockedActions
recoveryStrategyState.allowedActions
recoveryStrategyState.source.handshakeState
recoveryStrategyState.source.visualDeliveryState
recoveryStrategyState.source.unmatched
recoveryStrategyState.source.missingAck
recoveryStrategyState.source.noClient
recoveryStrategyState.source.waiting
~~~

## Sicherheitsanzeige

Der Tab zeigt zusätzlich die produktiven Berührungsflags:

~~~text
readOnly
productiveActions
flowTouched
queueTouched
soundSystemTouched
alertSystemTouched
overlayTouched
~~~

## Bewusst nicht eingebaut

~~~text
Keine Simulation-Buttons
Kein Aufruf von /api/bus-diagnostics/recovery-simulation/test
Keine Recovery-Automatik
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
~~~

## Erwarteter Test

Nach Deploy und Backend/Dashboard-Reload:

~~~text
Dashboard öffnen
Bus-Diagnostics öffnen
Status laden
Tab Recovery öffnen
Recovery-State sichtbar
Keine Test-/Recovery-Buttons sichtbar
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-5.10: Dashboard-Recovery-Tab live prüfen und stabil dokumentieren
~~~
