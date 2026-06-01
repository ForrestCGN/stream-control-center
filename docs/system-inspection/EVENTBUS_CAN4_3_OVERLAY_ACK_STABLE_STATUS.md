# EVENTBUS CAN-4.3 OVERLAY ACK STABLE STATUS

Stand: 2026-06-01
Status: stabiler Zwischenstand / Dokumentation

## Ergebnis

CAN-4.2 wurde live mit einem Test-Alert geprüft.

```text
Alert -> Sound -> Visual Overlay -> Finish-ACK
```

## Bestätigter Live-Stand

```text
alert_system: 3.1.9
sound_system: 0.1.20
bus_diagnostics: 1.2.2
traceCorrelationVersion: CAN-4.1
visualDeliveryVersion: CAN-4.1
```

## CAN-4.2 Testergebnis

```text
handshakeState: matched
visualDeliveryState: matched_and_visual_acknowledged
overlayRows: 1
acknowledged: 1
waiting: 0
missingAck: 0
noClient: 0
warnings: []
```

## ACK-Details

```text
ackEvent: finished
ackReason: finished
ackLatencyMs: 25867
status: acknowledged
```

## Bedeutung

Die Alert/Sound-Kette und die visuelle Overlay-Zustellung sind im Test sauber nachvollziehbar.

```text
Alert empfangen
-> Sound-Bundle vorbereitet/gepostet
-> Sound-System matched
-> Visual Overlay gesendet
-> Overlay Finish-ACK erhalten
```

## Nicht geändert

```text
Keine Queue-Logik geändert
Keine Sound-Playback-Logik geändert
Keine Overlay-Ausgabe geändert
Keine TTS-Logik geändert
Keine DB-/Config-Änderung
Keine Recovery-Automatik aktiviert
```

## Relevante Prüfbefehle

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/eventbus/correlation/status?check=1" | ConvertTo-Json -Depth 12
Invoke-RestMethod "http://127.0.0.1:8080/api/bus-diagnostics/check" | ConvertTo-Json -Depth 12
```

## Nächster sinnvoller Schritt

CAN-5 sollte weiterhin nicht sofort produktive Flows umbauen.

```text
CAN-5.0: Recovery-/Timeout-Strategie planen, aber zunächst read-only
```

Ziel: definieren, was bei `missingAck`, `noClient`, `unmatched` oder dauerhaftem `waiting` passieren darf, ohne versehentlich doppelte Alerts/Sounds auszulösen.
