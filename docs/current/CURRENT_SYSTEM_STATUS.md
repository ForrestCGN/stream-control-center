# Current System Status

## STEP278I - Module Version Metadata

Versions-Metadaten und verbindliche Versionierungsregel sind ergänzt.

Neu:

- `docs/backend/MODULE_VERSIONING_STANDARD.md`

Geändert:

- `backend/modules/communication_bus.js`
- `backend/modules/audit_log.js`
- `backend/modules/helpers/helper_communication.js`
- `backend/modules/helpers/helper_security_context.js`
- `backend/modules/helpers/helper_audit_log.js`

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

Regel:

- Alle zukünftigen Module bekommen `MODULE_META`.
- Status-Ausgaben enthalten `moduleVersion` und `moduleBuild`.
- STEP bleibt zusätzlich für die Projekt-Historie erhalten.
- Keine Funktionsänderung.
- Keine Produktivmigration.

## STEP278H - Communication Bus WebSocket Client Registration

Communication Bus kann WebSocket-Clients registrieren.

Geändert:

- `backend/server.js`
- `backend/modules/communication_bus.js`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/STEP278H_COMMUNICATION_WS_CLIENT_REGISTRATION.md`

Neu:

- `hello`
- `heartbeat`
- `ack`
- `bus_ack`
- minimaler optionaler Modul-Dispatcher in `server.js`

Wichtig:

- Keine Produktivmodule wurden migriert.
- `broadcastWS` bleibt unverändert.
- Unbekannte WS-Messages werden nicht blockiert.
- Keine Dashboard-Seite.
- Keine Datenbankmigration.
- Keine OBS-Änderung.
