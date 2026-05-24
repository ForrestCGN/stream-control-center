# NEXT_STEPS

## Nach STEP278L

1. Backend nach Deploy starten.
2. Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
3. Optional Bus zurücksetzen:
   - `http://127.0.0.1:8080/api/communication/reset?confirm=1&clients=1`
4. Overlay neu laden.
5. Status prüfen:
   - `http://127.0.0.1:8080/api/communication/status`
6. Erwartung:
   - Client `overlay_master_test` ist registriert.
   - Client-Type ist `overlay`.
   - Status ist `online`.
   - Capabilities sind gesetzt.
7. Testevent senden:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Hallo%20Master%20Overlay&requireAck=1&replayable=1`
8. Danach `/api/communication/status` prüfen:
   - Event wurde an `overlay_master_test` geliefert.
   - ACKs vom Overlay sind sichtbar.
9. Wenn stabil: nächsten STEP planen, z. B. Bus-Monitoring/Diagnose für Overlay-Reconnects oder gezielter Alert-Mirror-Test ohne Produktionsmigration.

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
5. Wenn stabil: STEP278L planen, z. B. Master-Overlay-Testclient oder Alert-Mirror-Test mit Bus.

## Nach STEP278J

1. Backend nach Deploy starten und Server-Log prüfen:
   - `[communication_bus] v0.3.0 / STEP278H ...`
   - `[audit_log] v0.2.0 / STEP278E ...`
2. Danach STEP278K planen: kleiner WebSocket-Testclient oder Master-Overlay-Testclient.
3. Alle zukünftigen Module nach `docs/backend/MODULE_VERSIONING_STANDARD.md` versionieren und mit Version/Build loggen.
