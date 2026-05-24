# STEP278D — Audit Log Helper

Status: Core helper prepared  
Production integration: none  
Database migration: none

## Ziel

`backend/modules/helpers/helper_audit_log.js` stellt eine zentrale Audit-/System-Log-Grundlage bereit.

Der Helper protokolliert noch keine produktiven Module automatisch. Er ist die Grundlage für spätere API-, Dashboard-, Bus-, Alert-, Sound- und Security-Logs.

## Enthaltene Funktionen

- `createAuditLogger(options)`
- `log(entry)`
- `createEntry(entry)`
- `getRecent(limit, filters)`
- `getStatus()`
- `clearMemory()`
- `child(defaults)`

## Sicherheitsbasis

Der Helper nutzt `helper_security_context.js` für:

- Security Context Normalisierung
- Actor-/Source-/Trust-Snapshots
- Maskierung sensibler Werte
- Audit-Snapshots

## Bewusst nicht enthalten

- keine Änderung an `server.js`
- keine API-Route
- keine Dashboard-Seite
- keine produktive Modul-Integration
- keine SQLite-/MariaDB-Migration
- kein automatisches Schreiben in `app.sqlite`
- kein Anzeigen von Secrets

## Später möglich

- `/api/audit/status`
- `/api/audit/recent`
- Dashboard-Systemlog
- DB-Tabelle `system_logs` per sanfter Migration
- Integration in Communication Bus, API-Routen, Dashboard-Aktionen
