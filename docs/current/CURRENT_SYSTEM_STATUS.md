# Current System Status

## STEP278L - Master Overlay Bus Test Mode

Das vorhandene Master-Test-Overlay ist jetzt ein echter Communication-Bus-Testclient im reinen Mirror-/Debug-Modus.

Geändert:

- `htdocs/overlays/_overlay-master-test.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`

Neu:

- `project-state/STEP278L_MASTER_OVERLAY_BUS_TEST_MODE.md`

URL:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

Version:

```text
overlay_master_test v0.1.0 / STEP278L
```

Das Overlay kann:

- WebSocket verbinden
- `type: "hello"` senden
- `type: "heartbeat"` senden
- Bus-Testevents empfangen
- ACKs mit `type: "ack"`, `eventId`, `clientId` und `status` senden
- Test-/Mirror-Karten anzeigen
- Debug-Status anzeigen

Wichtig:

- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Kein Ersatz von `broadcastWS`.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein `server.js`-Umbau.

## STEP278K - Communication WS Test Client

Ein manueller Browser-Testclient für den Communication Bus ist ergänzt.

Neu:

- `htdocs/public/tools/communication_ws_test_client.html`

URL:

```text
http://127.0.0.1:8080/public/tools/communication_ws_test_client.html
```

Version:

```text
communication_ws_test_client v0.1.0 / STEP278K
```

Der Testclient kann:

- WebSocket verbinden
- `hello` senden
- `heartbeat` senden
- Testevent per API erzeugen
- `ack` für letztes Event senden
- Communication Status anzeigen

Wichtig:

- Keine Produktivmigration.
- Keine Alert-/Sound-/TTS-/VIP-Integration.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Kein `server.js`-Umbau.

## STEP278J - Versioned Startup Logs

Startup-Logs der neuen Module enthalten Version und Build.

Geändert:

- `backend/modules/communication_bus.js`
- `backend/modules/audit_log.js`
- `docs/backend/MODULE_VERSIONING_STANDARD.md`

Neue Log-Ausgaben:

```text
[communication_bus] v0.3.0 / STEP278H API routes and WS handler registered
[audit_log] v0.2.0 / STEP278E API routes registered
```
