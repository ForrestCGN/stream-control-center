# CURRENT_STATUS

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

## STEP278G

Communication Bus Status/Test API vorbereitet.

Neu:

- `backend/modules/communication_bus.js`
- `project-state/STEP278G_COMMUNICATION_BUS_STATUS_API.md`

Routen:

```text
GET /api/communication/status
GET /api/communication/test?channel=test&action=ping&message=Hallo
GET /api/communication/ack?eventId=...&clientId=test_client&status=received
GET /api/communication/issue?key=test&message=Demo
GET /api/communication/reset?confirm=1
```

Wichtig:

- Keine Produktivmodule wurden migriert.
- Kein Ersatz von `broadcastWS`.
- Keine API-/Dashboard-/DB-Änderung außerhalb des neuen Communication-Moduls.
- Bus-Testevents sind Preview/Test und kein produktives Routing.

## STEP278F

Communication Bus kann optional Security Context und Audit Logger nutzen.

Geändert:

- `backend/modules/helpers/helper_communication.js`
- `config/communication_bus.json`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/STEP278F_COMMUNICATION_BUS_SECURITY_AUDIT.md`

Wichtig:

- Audit ist standardmäßig deaktiviert.
- Ohne übergebene Hooks bleibt das bisherige Bus-Verhalten erhalten.
- Keine Produktivmodule wurden migriert.
- Keine API-/Dashboard-/DB-Änderung.

## STEP278E

Audit API Status/Recent/Test vorbereitet.

Neu:

- `backend/modules/audit_log.js`
- `project-state/STEP278E_AUDIT_API_STATUS.md`

Routen:

```text
GET  /api/audit/status
GET  /api/audit/recent?limit=50
GET  /api/audit/test?message=...
POST /api/audit/clear-memory
GET  /api/audit/clear-memory?confirm=1
```

Wichtig:

- Noch keine produktive Modul-Integration.
- Keine Dashboard-Seite.
- Keine SQLite-/MariaDB-Migration.
- Logs bleiben standardmäßig im Memory Buffer.
- Helper nutzt `helper_security_context.js` für Kontext und Maskierung.
