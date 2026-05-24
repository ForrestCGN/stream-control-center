# NEXT_STEPS

## Nach STEP278M

1. Backend nach Deploy starten.
2. Master-Test-Overlay öffnen:
   - `http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1`
3. `/api/communication/status` prüfen.
4. Browserseite oder OBS-Browserquelle aktualisieren.
5. Erneut `/api/communication/status` prüfen.
6. Testevent senden:
   - `http://127.0.0.1:8080/api/communication/test?channel=test&action=ping&message=Reconnect%20Test&requireAck=1&replayable=1`
7. Danach prüfen:
   - Client `overlay_master_test` ist online.
   - `connectedAt`, `lastHeartbeatAt` und `lastAckAt` aktualisieren sich.
   - `delivered` und `acks` steigen.
8. Wenn stabil: STEP278N planen, z. B. gezielter Replay-/TTL-Test nach Reconnect oder erstes Alert-Mirror-Testevent ohne Produktivmigration.


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
