# STEP278J — Versioned Startup Logs

## Status

Implemented as log/output cleanup.

## Ziel

Neue Module sollen beim Start ihren Modulnamen, ihre Version und ihren Build ausgeben.

## Geänderte Dateien

- `backend/modules/communication_bus.js`
- `backend/modules/audit_log.js`
- `docs/backend/MODULE_VERSIONING_STANDARD.md`

## Neue Startup-Logs

```text
[communication_bus] v0.3.0 / STEP278H API routes and WS handler registered
[audit_log] v0.2.0 / STEP278E API routes registered
```

## Wichtig

- Keine Funktionsänderung.
- Keine neue Route.
- Keine Dashboard-Seite.
- Keine DB-Migration.
- Keine Produktivmigration.
- Kein `server.js`-Umbau.
- `broadcastWS` bleibt unverändert.
