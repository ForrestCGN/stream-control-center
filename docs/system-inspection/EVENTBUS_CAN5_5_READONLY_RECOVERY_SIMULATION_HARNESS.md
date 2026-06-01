# EVENTBUS CAN-5.5 READ-ONLY RECOVERY SIMULATION HARNESS

Stand: 2026-06-01
Status: Code-Step / read-only Diagnose

## Ergebnis

CAN-5.5 ergänzt einen isolierten Simulation-Harness in `bus_diagnostics`.

~~~text
/api/bus-diagnostics/recovery-simulation/status
/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck
~~~

## Sicherheitsversprechen

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

## Nicht geändert

~~~text
Keine echten Alerts
Keine echten Sounds
Keine Overlay-Steuerung
Keine Queue-Änderung
Keine automatische Recovery
Keine DB-/Config-Migration
~~~

## Szenarien

| Scenario | Zweck | Erwarteter Recovery-State |
|---|---|---|
| ok | Normalpfad | ok_no_recovery_needed |
| missingAck | fehlendes Overlay-Finish-ACK | blocked_missing_visual_ack |
| noClient | kein Overlay-Client | blocked_no_overlay_client |
| unmatched | Alert/Sound nicht korreliert | blocked_unmatched_alert_sound |
| waitingTooLong | ACK wartet noch | observe_waiting_for_ack |
| soundFetchFailed | Sound-Status nicht erreichbar | correlation_status_unavailable oder observe_warning |

## Prüfbefehle

~~~powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/status" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/test?scenario=noClient" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/recovery-simulation/test?scenario=unmatched" | ConvertTo-Json -Depth 12
~~~

## Nächster sinnvoller Schritt

~~~text
CAN-5.6: Simulation-Harness live testen
~~~

Erwartung: Alle Simulationen liefern nur Diagnosewerte und lösen keine produktive Aktion aus.
