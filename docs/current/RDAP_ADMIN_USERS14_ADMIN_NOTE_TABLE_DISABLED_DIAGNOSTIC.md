# RDAP_ADMIN_USERS14_ADMIN_NOTE_TABLE_DISABLED_DIAGNOSTIC

Stand: 2026-06-24  
Projekt: `stream-control-center` / Remote-Modboard

## Typ

Backend-Diagnose-Step, weiterhin read-only.

```text
Keine produktiven Writes.
Keine DB-Migration.
Keine SQL-Ausführung.
Keine UI-Schreibbuttons.
Keine Workflow-Tool-Änderung.
```

## Zweck

RDAP14 ergänzt eine deaktivierte/read-only Diagnose für die später geplante Admin-Notiz-Funktion.

Geplante spätere Funktion:

```text
Admin-Notiz zu einem Dashboard-User setzen/aktualisieren
```

RDAP14 prüft nur, ob die dafür geplante Tabelle existiert und ob die erwarteten Spalten vorhanden sind.

## Neue Route

```text
GET /api/remote/admin/users/admin-note-diagnostic
```

Die Route bleibt read-only und führt keine Migration und keinen Write aus.

## Erwartete Diagnosefelder

```text
prepared: true
route: /api/remote/admin/users/admin-note-diagnostic
tableName: dashboard_user_admin_notes
tableExists: true/false
schemaReady: true/false
migrationRequired: true/false
writeEnabled: false
databaseWriteEnabled: false
migrationEnabled: false
productiveWritesEnabled: false
writesStillBlocked: true
routeRemainsReadOnly: true
uiWriteButtonsEnabled: false
```

## Geplante spätere Tabelle

```text
dashboard_user_admin_notes
```

Erwartete Mindestspalten für spätere Planung:

```text
id
note_uid
target_user_uid
note_text
status
created_by_user_uid
created_at
updated_at
```

## Geplante spätere Write-Kette

```text
action: admin.users.note.set
permission: admin.users.note.write
lock: admin:user-note:<target_user_uid>
confirmWrite: Pflicht
audit: Pflicht
readBack: Pflicht
backup: Pflicht vor Migration/Write-Test
rollback: Pflicht vor Migration/Write-Test
```

## In RDAP14 ausdrücklich nicht aktiv

```text
POST/PUT/PATCH/DELETE-Routen
CREATE TABLE
INSERT
UPDATE
DELETE
Audit-Insert
Lock acquire/heartbeat/release/force-takeover
Backup-Ausführung
Rollback-Ausführung
User freigeben/sperren
Rollen/Gruppen ändern
Sessions widerrufen
UI-Schreibbuttons
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
```

## Geänderte Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-diagnostic.service.js
```

## Wichtiger Befund beim Dateistand

`admin-users.routes.js` war vorhanden, aber in `app.js` nicht registriert. RDAP14 registriert diese vorhandene read-only Route-Datei sauber im App-Setup, damit die bereits dokumentierten Diagnose-Routen nicht nur in `/api/remote/routes` stehen, sondern tatsächlich erreichbar sind.

Das aktiviert keine produktiven Writes.
