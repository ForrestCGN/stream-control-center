# NEXT_STEPS

## Nach STEP278Q

1. Backend nach Deploy starten.
2. Debug View öffnen:
   - `http://127.0.0.1:8080/public/tools/communication_debug_view.html`
3. Status aktualisieren.
4. Master-Test-Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
5. Testevent erzeugen:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Debug%20View%20Test&requireAck=1&replayable=1`
6. In der Debug View prüfen:
   - Client sichtbar
   - Event/ACK-Zähler nachvollziehbar
   - Watchdog-Diagnose lesbar
   - historische Issues sichtbar
7. Optional Recovery-Test über die Buttons durchführen:
   - Reset inkl. Clients
   - Overlay geschlossen lassen
   - Testevent mit langer TTL erzeugen
   - Watchdog tracken
   - Overlay öffnen
   - Replay auslösen
   - Watchdog + Recovery prüfen

Wenn stabil: Danach kann STEP278R geplant werden. Sinnvoll wäre entweder eine kleine Status-Summary-API für kompaktere Dashboards oder ein kontrollierter Alert-Mirror-Test über den Communication Bus ohne produktive Migration.

## Nach STEP278P

1. Backend nach Deploy starten.
2. Reset ausführen:
   - `http://127.0.0.1:8080/api/communication/reset?confirm=1&clients=1`
3. Overlay geschlossen lassen.
4. Testevent mit langer TTL erzeugen:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Recovery%20Test&requireAck=1&replayable=1&ttlMs=180000`
5. Watchdog Problemzustand tracken:
   - `http://127.0.0.1:8080/api/communication/watchdog?track=1`
6. Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
7. Replay auslösen:
   - `http://127.0.0.1:8080/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1`
8. Recovery prüfen:
   - `http://127.0.0.1:8080/api/communication/watchdog?includeRecovered=1`
9. Optional Recovery tracken:
   - `http://127.0.0.1:8080/api/communication/watchdog?includeRecovered=1&trackRecovered=1`
