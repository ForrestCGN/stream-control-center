# CURRENT_STATUS

## STEP278K

Communication WS Test Client ergänzt.

Neu:

- `htdocs/public/tools/communication_ws_test_client.html`
- `project-state/STEP278K_COMMUNICATION_WS_TEST_CLIENT.md`

Tool-Version:

```text
communication_ws_test_client v0.1.0 / STEP278K
```

URL:

```text
http://127.0.0.1:8080/public/tools/communication_ws_test_client.html
```

Funktionen:

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

## STEP278J

Versioned Startup Logs ergänzt.

Geändert:

- `backend/modules/communication_bus.js`
- `backend/modules/audit_log.js`
- `docs/backend/MODULE_VERSIONING_STANDARD.md`
- `project-state/STEP278J_VERSIONED_STARTUP_LOGS.md`

Neue Log-Ausgaben:

```text
[communication_bus] v0.3.0 / STEP278H API routes and WS handler registered
[audit_log] v0.2.0 / STEP278E API routes registered
```

Wichtig:

- Keine Funktionsänderung.
- Keine neue Route.
- Keine Dashboard-/DB-/OBS-Änderung.
- Keine Produktivmigration.

## STEP278I

Module Version Metadata und verbindliche Versionierungsregel ergänzt.

Neu:

- `docs/backend/MODULE_VERSIONING_STANDARD.md`

Wichtig:

- Alle zukünftigen Module sollen `MODULE_META` besitzen.
- Status-Ausgaben sollen `moduleVersion` und `moduleBuild` enthalten.
- Startup-Logs enthalten Version und Build.
- STEP bleibt zusätzlich als Projekt-Historie erhalten.
