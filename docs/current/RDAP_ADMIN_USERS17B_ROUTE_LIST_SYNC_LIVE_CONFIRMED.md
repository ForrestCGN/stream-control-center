# RDAP17B – Admin-Notiz Read-Diagnostic Route-List-Sync live bestaetigt

Stand: 2026-06-25  
Projekt: `stream-control-center` / RDAP Remote-Modboard  
Branch: `dev`

## Ziel

RDAP17B synchronisiert die Routenuebersicht fuer die in RDAP17 gebaute read-only Admin-Notiz-Read-Diagnostic-Route.

RDAP17 hatte fachlich bereits funktioniert:

```text
GET /api/remote/admin/users/admin-note-read-diagnostic?targetUserUid=test
```

Die Route antwortete korrekt, aber `/api/remote/routes` lieferte fuer den neuen Key noch `null`.

RDAP17B behebt nur diese Routenuebersicht.

## Live bestaetigter Stand

Webserver:

```text
mods.forrestcgn.de
/opt/stream-control-center/remote-modboard
scc-remote-modboard.service
```

Live-Check `/api/remote/routes`:

```text
statusApiVersion: rdap_admin_users17b.v1
adminUserAdminNoteReadDiagnostic.prepared: true
adminUserAdminNoteReadDiagnostic.route: /api/remote/admin/users/admin-note-read-diagnostic
adminUserAdminNoteReadDiagnostic.tableName: dashboard_user_admin_notes
adminUserAdminNoteReadDiagnostic.readOnly: true
adminUserAdminNoteReadDiagnostic.writeEnabled: false
adminUserAdminNoteReadDiagnostic.productiveWritesEnabled: false
adminUserAdminNoteReadDiagnostic.writesStillBlocked: true
adminUserAdminNoteReadDiagnostic.returnsNoteText: false
adminUserAdminNoteReadDiagnostic.noteTextIsRedacted: true
adminUserAdminNoteReadDiagnostic.routeListKeySynced: true
adminUserAdminNoteReadDiagnostic.aliasOf: adminUsersAdminNoteReadDiagnostic
```

Live-Check Admin-Notiz-Read-Diagnostic:

```text
ok: true
readOnly: true
writesStillBlocked: true
returnsNoteText: false
noteTextIsRedacted: true
totalCount: 0
```

## Bedeutung

RDAP16:

```text
dashboard_user_admin_notes existiert
schemaReady: true
migrationRequired: false
rowCount: 0
```

RDAP17:

```text
Admin-Notiz Read-Diagnostic-Route funktioniert read-only.
Keine Notiztexte werden ausgegeben.
```

RDAP17B:

```text
/api/remote/routes ist fuer die Admin-Notiz Read-Diagnostic synchronisiert.
```

## Geaendert durch RDAP17B

```text
remote-modboard/backend/src/routes/routes.routes.js
```

Ergaenzt wurden:

```text
adminUserAdminNoteReadDiagnostic
adminUsersAdminNoteReadDiagnostic
Route-Eintrag fuer /api/remote/admin/users/admin-note-read-diagnostic
statusApiVersion rdap_admin_users17b.v1
```

## Nicht geaendert

```text
Keine DB-Migration
Keine SQL-Ausfuehrung
Keine Inserts
Keine Updates
Keine Deletes
Keine Admin-Notiz-Write-Route
Keine Notiztext-Ausgabe
Keine UI-Schreibbuttons
Keine User-/Rollen-/Session-Aenderung
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
Keine Workflow-Tools
```

## Weiterhin blockiert

```text
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false
productiveWritesEnabled: false
writesStillBlocked: true
```

## Offener separater Punkt

Beim Webserver-Deploy kann der OAuth-Safety-Check weiterhin melden:

```text
twitch/start HTTP 302
twitch/callback HTTP 403
[fehler] OAuth Safety verletzt. Erwartet 403/403.
```

Das ist ein separater offener Workflow-/Deploy-Safety-Punkt und nicht Teil von RDAP17B.

## Naechster sinnvoller Fachstep

Nach RDAP17B kann geplant werden:

```text
RDAP_ADMIN_USERS18_ADMIN_NOTE_DISPLAY_SCOPE_PLAN
```

Dieser Step darf noch keine produktiven Writes aktivieren. Wenn echte Notiztexte angezeigt werden sollen, muss vorher serverseitig geklaert sein:

```text
Auth/Login aktiv und stabil
Permission admin.users.note.read
Rollen/Rechte fuer Owner/Admin/Mod
keine oeffentliche Ausgabe ueber Community-Seiten
Audit-/Zugriffsstrategie fuer interne Daten
```

Ein Admin-Notiz-Write bleibt weiterhin ein getrennter spaeterer Fachstep mit Permission, Confirm-Write, Audit, Lock und Read-Back.
