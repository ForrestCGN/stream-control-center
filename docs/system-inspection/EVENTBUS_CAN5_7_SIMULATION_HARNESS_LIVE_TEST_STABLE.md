# EVENTBUS CAN-5.7 SIMULATION HARNESS LIVE TEST STABLE

Stand: 2026-06-01
Status: stabiler Live-Test / Dokumentation

## Ausgangslage

CAN-5.5 hat einen isolierten read-only Recovery-Simulation-Harness in `bus_diagnostics` ergänzt.
CAN-5.5.1 hat die `/api/bus-diagnostics/routes`-Metadaten bereinigt.
CAN-5.6 wurde live gegen die Simulation-Endpunkte getestet.

## Bestätigter Harness-Status

~~~text
/api/bus-diagnostics/recovery-simulation/status
bus_diagnostics: 1.2.4
feature: recovery_simulation_harness
simulationVersion: CAN-5.5
readOnly: true
automationEnabled: false
productiveActions: false
~~~

## Sicherheitszustand

Bei den geprüften Tests blieben alle produktiven Berührungsflags deaktiviert.

~~~text
flowTouched: false
queueTouched: false
soundSystemTouched: false
alertSystemTouched: false
overlayTouched: false
~~~

## Geprüfte Szenarien

~~~text
missingAck
noClient
unmatched
~~~

## Ergebnis missingAck

~~~text
scenario: missingAck
synthetic: true
state: blocked_missing_visual_ack
severity: warning
reason: missing_visual_finish_ack
nextAction: manual_overlay_review
productiveActions: false
automationEnabled: false
~~~

## Ergebnis noClient

~~~text
scenario: noClient
synthetic: true
state: blocked_no_overlay_client
severity: warning
reason: no_overlay_client_at_send
nextAction: check_obs_browser_source
productiveActions: false
automationEnabled: false
~~~

## Ergebnis unmatched

~~~text
scenario: unmatched
synthetic: true
state: blocked_unmatched_alert_sound
severity: warning
reason: unmatched_alert_sound_rows
nextAction: manual_trace_review
productiveActions: false
automationEnabled: false
~~~

## Bestätigung

~~~text
Simulation-Harness funktioniert.
Fehlerzustände werden korrekt erkannt.
Keine echten Alerts/Sounds/Overlays werden ausgelöst.
Keine automatische Recovery ist aktiv.
~~~

## Nicht geändert

~~~text
Keine Queue-Logik geändert
Keine Sound-Playback-Logik geändert
Keine Overlay-Ausgabe geändert
Keine TTS-Logik geändert
Keine automatische Recovery aktiviert
Keine DB-/Config-Migration
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-5.8: Recovery-Diagnose im Dashboard sichtbar machen oder Dashboard-Plan erstellen
~~~

Dashboard-Regel:

~~~text
Nur read-only anzeigen.
Keine Simulation per Dashboard auslösen, bevor UI-Schutz, Labeling und Rechte klar sind.
~~~
