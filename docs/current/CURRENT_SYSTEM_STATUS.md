# Current System Status

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
