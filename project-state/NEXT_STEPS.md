# NEXT_STEPS

## Nach STEP278O

1. Backend nach Deploy starten.
2. Status prüfen:
   - `http://127.0.0.1:8080/api/communication/status`
3. Erwartung:
   - `moduleVersion: "0.5.0"`
   - `moduleBuild: "STEP278O"`
4. Reset ohne Clients ausführen:
   - `http://127.0.0.1:8080/api/communication/reset?confirm=1&clients=1`
5. Overlay geschlossen lassen.
6. ACK-pflichtiges replayable Event erzeugen:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Watchdog%20No%20Client&requireAck=1&replayable=1&ttlMs=60000`
7. Erwartung:
   - `deliveredCount: 0`
8. Watchdog trocken prüfen:
   - `http://127.0.0.1:8080/api/communication/watchdog`
9. Erwartung:
   - Diagnose enthält `communication_no_clients`, `communication_event_not_delivered_*` und `communication_ack_missing_*`.
   - `tracked: false`
10. Watchdog mit Tracking ausführen:
   - `http://127.0.0.1:8080/api/communication/watchdog?track=1`
11. Status prüfen:
   - `http://127.0.0.1:8080/api/communication/status`
12. Erwartung:
   - `stats.issues` steigt.
   - `issues[]` enthält Watchdog-Diagnosen.

Wenn stabil: STEP278P planen. Sinnvoll wäre danach ein kontrollierter Alert-Mirror-Test über den Communication Bus ohne Produktivmigration.

## Nach STEP278N

1. Backend nach Deploy starten.
2. Reset ausführen:
   - `http://127.0.0.1:8080/api/communication/reset?confirm=1&clients=1`
3. Overlay geschlossen lassen.
4. Replayable Testevent mit langer TTL erzeugen:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Replay%20Test&requireAck=1&replayable=1&ttlMs=60000`
5. Erwartung: `deliveredCount: 0`, Event bleibt im Bus-Speicher.
6. Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
7. Replay auslösen:
   - `http://127.0.0.1:8080/api/communication/replay?clientId=overlay_master_test&includeAckRequired=1`
8. Erwartung: `replayed: 1`.
9. Status prüfen:
   - `http://127.0.0.1:8080/api/communication/status`
10. Erwartung: `replays` und `acks` steigen, `lastAckAt` aktualisiert sich.

## Nach STEP278M

1. Backend nach Deploy starten.
2. Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
3. Status prüfen:
   - `http://127.0.0.1:8080/api/communication/status`
4. Browserseite oder OBS-Browserquelle aktualisieren.
5. Status erneut prüfen.
6. Testevent senden:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Reconnect%20Test&requireAck=1&replayable=1`
7. Danach Status erneut prüfen.

## Nach STEP278L

1. Backend nach Deploy starten.
2. Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
3. Status prüfen:
   - `http://127.0.0.1:8080/api/communication/status`
4. Testevent senden:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Hallo%20Master%20Overlay&requireAck=1&replayable=1`
5. Danach `/api/communication/status` prüfen.

## Nach STEP278K

1. Backend nach Deploy starten.
2. Browser öffnen:
   - `http://127.0.0.1:8080/public/tools/communication_ws_test_client.html`
3. Testablauf:
   - Connect
   - Send hello
   - Refresh Status
   - Send heartbeat
   - Test Event API
   - Ack last event
4. Danach `/api/communication/status` prüfen.
