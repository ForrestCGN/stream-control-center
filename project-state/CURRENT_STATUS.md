# CURRENT_STATUS

Stand: RDAP_ADMIN_USERS20B_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard

## Produktiv

```text
https://mods.forrestcgn.de/
/opt/stream-control-center/remote-modboard
scc-remote-modboard.service
```

## Aktueller bestaetigter RDAP-Stand

RDAP16 ist live ausgefuehrt und bestaetigt:

```text
Tabelle: dashboard_user_admin_notes
tableExists: true
schemaReady: true
migrationRequired: false
rowCount: 0
writesStillBlocked: true
writeEnabled: false
productiveWritesEnabled: false
```

Backup vor Migration:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap16_before_admin_note_table_20260625_070106.sql
```

RDAP17 ist live bestaetigt:

```text
GET /api/remote/admin/users/admin-note-read-diagnostic?targetUserUid=test
ok: true
readOnly: true
writesStillBlocked: true
returnsNoteText: false
noteTextIsRedacted: true
totalCount: 0
```

RDAP17B ist live bestaetigt:

```text
GET /api/remote/routes
statusApiVersion: rdap_admin_users17b.v1
adminUserAdminNoteReadDiagnostic.prepared: true
adminUserAdminNoteReadDiagnostic.routeListKeySynced: true
adminUserAdminNoteReadDiagnostic.readOnly: true
adminUserAdminNoteReadDiagnostic.writesStillBlocked: true
adminUserAdminNoteReadDiagnostic.returnsNoteText: false
adminUserAdminNoteReadDiagnostic.noteTextIsRedacted: true
```

RDAP18 ist abgeschlossen:

```text
Admin-Notiz Display-Scope geplant
admin.users.note.read fuer spaetere Anzeige vorgesehen
admin.users.note.write bleibt separater Write-Scope
Community-Seiten duerfen Admin-Notizen niemals anzeigen
```

RDAP19 ist abgeschlossen:

```text
Auth-/Permission-Read-Check fuer Admin-Notizen geplant
Keine Backend-/DB-/UI-Aenderung
```

RDAP20 ist live bestaetigt:

```text
GET /api/remote/routes
statusApiVersion: rdap_admin_users20.v1
adminUserAdminNoteReadPermissionDiagnostic.prepared: true
adminUserAdminNoteReadPermissionDiagnostic.routeListKeySynced: true
adminUserAdminNoteReadPermissionDiagnostic.permissionKey: admin.users.note.read
adminUserAdminNoteReadPermissionDiagnostic.readOnly: true
adminUserAdminNoteReadPermissionDiagnostic.writesStillBlocked: true
adminUserAdminNoteReadPermissionDiagnostic.returnsNoteText: false
adminUserAdminNoteReadPermissionDiagnostic.noteTextIsRedacted: true
```

Unauthentifizierter Zugriff auf die Permission-Diagnostic ist korrekt blockiert:

```text
GET /api/remote/admin/users/admin-note-read-permission-diagnostic?targetUserUid=test
HTTP/1.1 401 Unauthorized
ok: false
loggedIn: false
dashboardAccess: false
canReadAdminNotes: false
reason: not_logged_in_or_session_invalid
```

## Service-Status

Der Status-Endpunkt kann weiterhin den aelteren Service-Build anzeigen, wenn nur Diagnose-/Routen-/Doku-/SQL-nahe Steps betroffen waren:

```text
moduleBuild: RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC
statusApiVersion: rdap_admin_users14b.v1
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Das ist aktuell kein Fehler, solange die konkreten RDAP20-Routen korrekt antworten.

## Weiterhin nicht aktiv

```text
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
Admin-Notiz schreiben
Admin-Notiztexte produktiv anzeigen
Audit-Inserts oder Audit-Updates
Lock acquire/heartbeat/release/force-takeover
UI-Schreibbuttons
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
```
