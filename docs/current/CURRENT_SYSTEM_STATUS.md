# Current System Status

## STEP278M - Master Overlay Reconnect / OBS Reload Test

Das Master-Test-Overlay wurde für Browser-/OBS-Reloads und WebSocket-Reconnects gehärtet.

Geändert:

- `htdocs/overlays/_overlay-master-test.html`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/STEP278M_RECONNECT_OBS_RELOAD_TEST.md`

Version:

```text
overlay_master_test v0.1.1 / STEP278M
```

URL:

```text
http://127.0.0.1:8080/overlays/_overlay-master-test.html?debug=1
```

Neu:

- Reconnect-/Session-Debug
- neue Session-ID pro WebSocket-Verbindung
- `connectCount` und `disconnectCount`
- Zeitstempel für letzte Verbindung, Trennung, `hello_ack` und `heartbeat_ack`
- Heartbeat-Intervall wird bei Disconnect gestoppt und nach Reconnect neu gestartet
- alte Testkarten werden bei WebSocket-Close/Open ausgeblendet

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
