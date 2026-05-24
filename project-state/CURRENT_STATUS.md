# CURRENT_STATUS

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

Geändert:

- `backend/modules/communication_bus.js`
- `backend/modules/audit_log.js`
- `backend/modules/helpers/helper_communication.js`
- `backend/modules/helpers/helper_security_context.js`
- `backend/modules/helpers/helper_audit_log.js`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/backend/AUDIT_LOG_HELPER.md`
- `docs/backend/SECURITY_CONTEXT_HELPER.md`
- `project-state/STEP278I_MODULE_VERSION_METADATA.md`

Neu:

- `docs/backend/MODULE_VERSIONING_STANDARD.md`

Wichtig:

- Alle zukünftigen Module sollen `MODULE_META` besitzen.
- Status-Ausgaben sollen `moduleVersion` und `moduleBuild` enthalten.
- STEP bleibt zusätzlich als Projekt-Historie erhalten.
- Keine Funktionsänderung.
- Keine Produktivmigration.

Aktuelle Versionen:

```text
Communication Core:          v0.3.0
helper_communication.js:     v0.3.0 / STEP278F
communication_bus.js:        v0.3.0 / STEP278H

Security Context Core:       v0.1.0
helper_security_context.js:  v0.1.0 / STEP278C

Audit Core:                  v0.2.0
helper_audit_log.js:         v0.1.0 / STEP278D
audit_log.js:                v0.2.0 / STEP278E
```

## STEP278H

Communication Bus WebSocket Client Registration vorbereitet.

Geändert:

- `backend/server.js`
- `backend/modules/communication_bus.js`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/STEP278H_COMMUNICATION_WS_CLIENT_REGISTRATION.md`

Neu:

- WebSocket `hello`
- WebSocket `heartbeat`
- WebSocket `ack` / `bus_ack`
- minimaler Modul-Dispatcher in `server.js` für `handleWsMessage()`

Wichtig:

- Keine Produktivmodule wurden migriert.
- `broadcastWS` bleibt unverändert.
- Unbekannte WS-Messages werden nicht blockiert.
- Keine Dashboard-/DB-/OBS-Änderung.
