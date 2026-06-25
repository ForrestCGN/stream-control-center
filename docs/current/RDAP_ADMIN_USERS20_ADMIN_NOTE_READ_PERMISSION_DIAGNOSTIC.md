# RDAP_ADMIN_USERS20_ADMIN_NOTE_READ_PERMISSION_DIAGNOSTIC

Stand: 2026-06-25  
Projekt: `stream-control-center` / RDAP Remote-Modboard  
Typ: kleiner Backend-Code-Step, read-only

## Ausgangslage

Bestaetigter Stand:

```text
RDAP16: Tabelle dashboard_user_admin_notes existiert, schemaReady true, rowCount 0.
RDAP17: Admin-Notiz Read-Diagnostic funktioniert read-only.
RDAP17B: /api/remote/routes ist synchron fuer adminUserAdminNoteReadDiagnostic.
RDAP18: Display-Scope geplant.
RDAP19: Auth-/Permission-Read-Check fuer Admin-Notizen geplant.
```

## Ziel

RDAP20 fuegt eine neue read-only Permission-Diagnostic fuer die spaetere Admin-Notiz-Anzeige hinzu:

```http
GET /api/remote/admin/users/admin-note-read-permission-diagnostic?targetUserUid=test
```

Diese Route prueft nur vorbereitend, ob ein eingeloggter Actor spaeter Admin-Notizen lesen duerfte.

Geplante Permission:

```text
admin.users.note.read
```

Diese Permission bleibt getrennt von:

```text
admin.users.note.write
```

## Schutzregeln

```text
Keine Notiztexte ausgeben.
Keine Admin-Notiz schreiben.
Keine Admin-Notiz aendern.
Keine Admin-Notiz loeschen.
Keine DB-Migration.
Keine UI-Schreibbuttons.
Keine User-/Rollen-/Session-Aenderung.
Keine Audit-/Lock-/Confirm-Write-Aktion.
Keine Community-Seiten-Ausgabe interner Admin-Notizen.
```

## Geaenderte Dateien

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-read-permission-diagnostic.service.js
remote-modboard/backend/package.json
```

## Erwartete Route

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/admin/users/admin-note-read-permission-diagnostic?targetUserUid=test" | jq
```

Ohne gueltige Session ist HTTP 401 erwartet. Wichtig ist, dass der Body weiterhin zeigt:

```text
readOnly: true
writesStillBlocked: true
returnsNoteText: false
noteTextReturned: false
noteTextIsRedacted: true
```

## Erwartete Routenuebersicht

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminUserAdminNoteReadPermissionDiagnostic'
```

Erwartung:

```text
rdap_admin_users20.v1
prepared: true
routeListKeySynced: true
permissionKey: admin.users.note.read
writesStillBlocked: true
returnsNoteText: false
noteTextIsRedacted: true
```

## Naechster sinnvoller Step

Nach Live-Bestaetigung:

```text
RDAP20B Doku-/Status-Sync nach Live-Bestaetigung
```

Danach erst planen, ob eine echte Anzeige-Route mit Notiztexten gebaut werden darf. Diese braucht zwingend Auth, Session, Permission und darf nicht fuer Community-Seiten genutzt werden.
