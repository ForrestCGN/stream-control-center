# Communication Bus / Alert Diagnose

Aktueller Stand umfasst Bus-Status, Replay, Watchdog, echten Alert-Bus-Mirror, Alert-Timing, echtes Alert-Overlay-ACK und sichere manuelle Alert-Overlay-Recovery.

## Relevante Routen

```text
/api/communication/status
/api/communication/watchdog
/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1
/api/alerts/bus-mirror/status
/api/alerts/bus-mirror/enable?confirm=1
/api/alerts/bus-mirror/disable?confirm=1
/api/alerts/overlay-watchdog/status
/api/alerts/overlay-watchdog/check
/api/alerts/overlay-watchdog/reset?confirm=1
/api/alerts/overlay-watchdog/recover?confirm=1
```

## Debug View

```text
http://127.0.0.1:8080/public/tools/communication_debug_view.html
```

## Aktuelles Audit-Ergebnis

Der getestete Alert-Pfad funktioniert:

```text
sound/tts sync -> playing -> sendOverlay -> bus mirror -> overlay finished ack
```

Die Recovery-Route sendet nur ein Overlay-`clear`. Queue, Sound und TTS bleiben unverändert.

## Weitere Details

Siehe:

```text
docs/backend/COMMUNICATION_AUDIT_STEP279_RESULT.md
project-state/STEP279_COMMUNICATION_AUDIT_RESULT.md
```


## STEP280

Die Communication Debug View unterstützt einen manuellen Diagnose-Snapshot. Sichtbare Versionen bleiben versionsbasiert; STEP-Nummern bleiben Dokumentation/ZIP vorbehalten.


## STEP281

Die Communication Debug View enthält nun einen Normalbetrieb-/Live-Check. Der Check ist nur lesend und ändert keine Alert-, Sound-, TTS- oder Queue-Logik.


## STEP283 Hinweis
Die Alert-Bus-Bridge registriert sich als `overlay_alerts_v2_bus_bridge` mit Capability `visual.alert.play`. Der Debug-View-Normalbetrieb erkennt diesen Client und warnt, wenn zusätzlich alte Alert-Quellen parallel verbunden sind.

## STEP284 Hinweis

Nach STEP283 ist die neue Alert Bus Bridge `htdocs/overlays/_overlay-alerts-v2-bus.html` erfolgreich getestet. Sie registriert sich als `overlay_alerts_v2_bus_bridge` und empfängt `visual.alert.play` über den Communication Bus. Der Real Alert Mirror bleibt aktuell Test-/Diagnoseweg und soll später durch einen nativen Alert-Bus-Ausgabeweg ersetzt werden.
