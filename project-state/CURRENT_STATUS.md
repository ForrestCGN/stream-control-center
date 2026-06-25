# CURRENT_STATUS

Stand: RDAP_ADMIN_USERS17B_ROUTE_LIST_SYNC_LIVE_CONFIRMED  
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

## Service-Status

Der Status-Endpunkt kann weiterhin den aelteren Service-Build anzeigen, wenn nur Diagnose-/Routen-/Doku-/SQL-nahe Steps betroffen waren:

```text
moduleBuild: RDAP_ADMIN_USERS14B_ADMIN_NOTE_ROUTE_LIST_SYNC
statusApiVersion: rdap_admin_users14b.v1
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
```

Das ist aktuell kein Fehler, solange die konkreten RDAP17/RDAP17B-Routen korrekt antworten.

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
