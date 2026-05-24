# STEP278E — Audit API Status

Status: API module prepared  
Production module integration: none  
Database migration: none

## Ziel

`backend/modules/audit_log.js` macht den vorbereiteten Audit Logger über kleine lokale API-Routen testbar.

## Routen

```text
GET  /api/audit/status
GET  /api/audit/recent?limit=50
GET  /api/audit/test?message=Hallo
POST /api/audit/clear-memory
GET  /api/audit/clear-memory?confirm=1
```

## Filter für Recent

```text
level
category
result
action
actorType
actorId
sourceKind
module
search
since
```

## Wichtig

- Es werden noch keine bestehenden Module automatisch geloggt.
- Es gibt keine Datenbankmigration.
- Logs bleiben standardmäßig im Memory Buffer.
- Secrets werden über `helper_security_context.js` maskiert.
- File/DB-Sinks bleiben deaktiviert, solange `config/audit_log.json` das so vorgibt.
