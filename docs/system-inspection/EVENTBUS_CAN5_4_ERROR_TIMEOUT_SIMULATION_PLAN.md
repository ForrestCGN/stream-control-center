# EVENTBUS CAN-5.4 ERROR / TIMEOUT SIMULATION PLAN

Stand: 2026-06-01
Status: Plan / Read-only Vorbereitung

## Ausgangslage

CAN-5.2 und CAN-5.3 bestätigen den erfolgreichen Normalpfad.

~~~text
Alert erfolgreich
Sound erfolgreich
Visual ACK erfolgreich
Recovery bleibt read-only
keine Automatik ausgelöst
~~~

## Ziel von CAN-5.4

CAN-5.4 plant kontrollierte Fehler- und Timeout-Simulationen, ohne produktive Wiederholungen auszulösen.

Es geht nur darum, Diagnosezustände sichtbar und eindeutig auswertbar zu machen.

## Nicht-Ziel

~~~text
Keine automatische Recovery
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Kein Overlay-Retry
Keine Queue-Änderung
Keine produktive Flow-Änderung
~~~

## Zu simulierende Zustände

~~~text
missingAck
noClient
unmatched
waiting_too_long
sound_fetch_failed
bundle_wait_timeout
overlay_watchdog_issue
~~~

## Sicherheitsregeln

~~~text
Simulationen müssen explizit als Test markiert sein.
Simulationen dürfen keine echten Zuschauer-Alerts wiederholen.
Simulationen dürfen keine echten Sound-/Overlay-Flows doppelt auslösen.
Simulationen sollen bevorzugt synthetische Statusdaten oder dedizierte Test-Endpunkte nutzen.
Produktive Queue-/Sound-/Overlay-Pfade bleiben unverändert.
~~~

## Geplante Simulations-Matrix

| Zustand | Simulationsidee | Erwarteter Recovery-State | Automatik |
|---|---|---|---|
| matched_and_visual_acknowledged | normaler Test-Alert | ok_no_recovery_needed | aus |
| matched_but_visual_ack_missing | ACK absichtlich nicht senden oder synthetisch erzwingen | manual_review_missing_ack | aus |
| matched_but_no_overlay_client | Test ohne Overlay-Client oder synthetischer noClient-Status | manual_review_no_client | aus |
| unmatched | Alert-Trace ohne Sound-Match synthetisch prüfen | manual_review_unmatched | aus |
| waiting_too_long | waiting über expectedAckBy hinaus synthetisch prüfen | manual_review_timeout | aus |
| sound_eventbus_unavailable | Sound-Status-Fetch synthetisch failen lassen | manual_review_sound_status | aus |

## CAN-5.5 Vorschlag

~~~text
CAN-5.5: Read-only Simulation Harness planen oder minimal ergänzen
~~~

Nur wenn klar ist, dass die Simulationen strikt isoliert sind:

~~~text
/api/bus-diagnostics/recovery-simulation/status
/api/bus-diagnostics/recovery-simulation/test?scenario=missingAck
~~~

Diese Endpunkte dürfen nur Diagnosewerte erzeugen und keine produktiven Aktionen auslösen.

## Prüfkriterien vor Code

~~~text
Ist der Test synthetisch?
Ist klar sichtbar, dass es ein Test ist?
Kann er keine echten Alerts/Sounds/Overlays erneut auslösen?
Bleibt automationEnabled=false?
Bleiben blockedActions aktiv?
Bleiben queueTouched/soundSystemTouched/overlayTouched false?
~~~
