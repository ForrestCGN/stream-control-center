# CURRENT_STATUS

Stand: RDAP_ADMIN_USERS24B_LIVE_CONFIRMED_DOCS  
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

RDAP17 / RDAP17B sind live bestaetigt:

```text
GET /api/remote/admin/users/admin-note-read-diagnostic?targetUserUid=test
ok: true
readOnly: true
writesStillBlocked: true
returnsNoteText: false
noteTextIsRedacted: true
totalCount: 0

GET /api/remote/routes
statusApiVersion: rdap_admin_users17b.v1
adminUserAdminNoteReadDiagnostic.routeListKeySynced: true
```

RDAP18 / RDAP19 / RDAP21 / RDAP22 / RDAP23 sind Plan- und Scope-Steps:

```text
RDAP18: Admin-Notiz Display-Scope geplant
RDAP19: Auth-/Permission-Read-Check fuer Admin-Notizen geplant
RDAP21: Display-Readiness geplant
RDAP22: echte Read-Route geplant, aber nicht gebaut
RDAP23: Auth-/Session-/Login-Aktivierung groesser gebuendelt geplant
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

RDAP24 ist live bestaetigt:

```text
GET /api/remote/status
moduleBuild: RDAP_ADMIN_USERS24_AUTH_SESSION_OAUTH_READINESS_DIAGNOSTIC
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false

GET /api/remote/routes
statusApiVersion: rdap_admin_users24.v1
authSessionOauthReadinessDiagnostic.prepared: true
authSessionOauthReadinessDiagnostic.routeListKeySynced: true

GET /api/remote/auth/readiness-diagnostic
ok: true
readOnly: true
readiness.readyForLoginSmokeTest: true
readiness.blockers: []
```

## OAuth-Safety-Klaerung

```text
403/403 ist korrekt, wenn Login/OAuth deaktiviert bleiben soll.
302/403 ist korrekt, wenn Login/OAuth bewusst aktiviert ist:
  twitch/start -> 302 Redirect zu Twitch
  twitch/callback ohne gueltigen Code/State -> 403
```

Der Deploy-Safety-Check muss spaeter an diese Unterscheidung angepasst werden.

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
