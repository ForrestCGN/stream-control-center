# CURRENT_STATUS

Stand: RDAP27B_ADMIN_NOTE_REAL_READ_ROUTE_LIVE_CONFIRMED_DOCS  
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

Backup vor RDAP16-Migration:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap16_before_admin_note_table_20260625_070106.sql
```

RDAP24 ist live bestaetigt:

```text
GET /api/remote/status
moduleBuild: RDAP_ADMIN_USERS24_AUTH_SESSION_OAUTH_READINESS_DIAGNOSTIC
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false

GET /api/remote/auth/readiness-diagnostic
ok: true
readOnly: true
readiness.readyForLoginSmokeTest: true
readiness.blockers: []
```

RDAP25 Login-Smoke-Test ist live bestaetigt:

```text
Login erfolgreich: ja
loggedIn: true
dashboardAccess: true
accessReason: allowed_login
User: ForrestCGN / tw:127709954
Session-Cookie: scc_remote_session
Session gueltig: true
Session-Reason: session_valid_readonly
```

RDAP26 Option B Permission-Seed ist live bestaetigt:

```text
Backup:
  /opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap26_before_owner_permission_seed_20260625_080740.sql

User:
  tw:127709954 | ForrestCGN | forrestcgn | active

Rolle:
  owner

Permissions:
  owner -> admin.users.note.read -> allow
  owner -> remote.view           -> allow
```

Browser-/API-Test nach RDAP26 erfolgreich:

```text
remote.view:
  diagnostics.effectivePermissionWouldAllow: true
  diagnostics.effectivePermissionReason: explicit_allow
  diagnostics.roles: ["owner"]
  diagnostics.permissionRows.rolePermissions: 1

admin.users.note.read:
  diagnostics.effectivePermissionWouldAllow: true
  diagnostics.effectivePermissionReason: explicit_allow
  diagnostics.roles: ["owner"]
  diagnostics.permissionRows.rolePermissions: 1
```

RDAP27 echte read-only Admin-Notiztext-Route ist live bestaetigt:

```text
moduleBuild: RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false

GET /api/remote/routes
statusApiVersion: rdap_admin_users27.v1
adminUserAdminNoteRealReadAuthed.prepared: true
adminUserAdminNoteRealReadAuthed.route: /api/remote/admin/users/admin-notes/read
adminUserAdminNoteRealReadAuthed.requiresValidSession: true
adminUserAdminNoteRealReadAuthed.requiresDashboardAccess: true
adminUserAdminNoteRealReadAuthed.requiresEffectiveReadPermission: true
adminUserAdminNoteRealReadAuthed.usesDbPermissionOnlyForAdminRead: true
adminUserAdminNoteRealReadAuthed.allowlistOwnerDoesNotGrantAdminRead: true
adminUserAdminNoteRealReadAuthed.returnsNoteTextWhenAuthorized: true
adminUserAdminNoteRealReadAuthed.uiWriteButtonsEnabled: false
```

Sicherheitstest ohne Browser-Session:

```text
HTTP 401
reason: not_logged_in_or_session_invalid
noteTextReturned: false
```

Browser-Test mit gueltiger Session:

```text
ok: true
loggedIn: true
dashboardAccess: true
canReadAdminNotes: true
reason: admin_note_real_read_ready
effectiveReadPermissionWouldAllow: true
readReason: explicit_allow
canWriteAdminNotes: false
effectiveWritePermissionWouldAllow: false
writeReason: no_matching_permission
tableExists: true
schemaReady: true
rowCount: 0
notes: []
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
Admin-Notiz schreiben
Admin-Notiz aendern
Admin-Notiz loeschen
Permission admin.users.note.write
UI-Schreibbuttons
User freigeben/sperren
Rollen vergeben/entziehen
Gruppen/Freigaben setzen/entfernen
Sessions widerrufen
Audit-Inserts oder Audit-Updates
Lock acquire/heartbeat/release/force-takeover
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
```
