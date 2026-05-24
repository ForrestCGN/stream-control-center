# NEXT_STEPS

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

Wenn stabil: STEP278O planen. Sinnvoll wäre danach eine reine Diagnose-/Monitoring-Ansicht für Bus-Events/Clients oder ein kontrollierter Alert-Mirror-Test ohne Produktivmigration.

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
