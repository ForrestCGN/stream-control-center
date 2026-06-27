# RDAP_ADMIN_USERS19_AUTH_PERMISSION_READ_CHECK_FOR_ADMIN_NOTES

Stand: 2026-06-25
Projekt: `stream-control-center` / RDAP Remote-Modboard
Typ: Plan-/Scope-Step

## Ausgangslage

Bestaetigter Stand:

```text
RDAP16: Tabelle `dashboard_user_admin_notes` existiert auf dem Webserver.
RDAP16 Diagnose: tableExists true, schemaReady true, migrationRequired false, rowCount 0.
RDAP17: Read-Diagnostic-Route funktioniert read-only.
RDAP17B: `/api/remote/routes` ist fuer `adminUserAdminNoteReadDiagnostic` synchronisiert.
RDAP18: Display-Scope ist geplant.
```

Wichtig:

```text
Die aktuelle Read-Diagnostic gibt weiterhin keine Notiztexte zurueck.
Writes bleiben blockiert.
Echte Notiztext-Anzeige darf erst nach Auth-/Permission-Pruefung gebaut werden.
```

## Ziel von RDAP19

RDAP19 soll nicht die echte Anzeige von Admin-Notizen bauen.

RDAP19 plant nur die serverseitige Auth-/Permission-Pruefung fuer eine spaetere echte Anzeige-Route.

Geplante spaetere Permission:

```text
admin.users.note.read
```

Diese Permission ist getrennt von:

```text
admin.users.note.write
```

## Harte Schutzregeln

```text
Keine Notiztexte ausgeben.
Keine Admin-Notiz schreiben.
Keine Admin-Notiz aendern.
Keine Admin-Notiz loeschen.
Keine UI-Schreibbuttons bauen.
Keine DB-Migration.
Keine User-/Rollen-/Session-Aenderung.
Keine Community-Seiten-Ausgabe interner Admin-Notizen.
```

## Empfohlene RDAP19-Umsetzung fuer den naechsten Code-Step

Der erste technische Schritt sollte eine weitere read-only Diagnostic-Route sein, nicht direkt die echte Display-Route.

Empfohlene Route:

```http
GET /api/remote/admin/users/admin-note-read-permission-diagnostic?targetUserUid=test
```

Zweck:

```text
- prueft Session read-only
- prueft vorhandenen Auth-/Session-Status read-only
- prueft geplante Permission admin.users.note.read read-only
- gibt nur Entscheidungs-/Statusdaten zurueck
- gibt keine Notiztexte zurueck
- fuehrt keine Writes aus
```

## Erwartetes Verhalten der Permission-Diagnostic

Ohne Login/ungueltige Session:

```text
HTTP 401 oder 200 mit ok false, je nach bestehendem Diagnosemuster
loggedIn false
canReadAdminNotes false
returnsNoteText false
writesStillBlocked true
```

Mit Login, aber ohne Permission:

```text
HTTP 403 oder 200 mit ok false, je nach bestehendem Diagnosemuster
loggedIn true
canReadAdminNotes false
permissionKey admin.users.note.read
returnsNoteText false
writesStillBlocked true
```

Mit Login und Permission:

```text
ok true
loggedIn true
canReadAdminNotes true
permissionKey admin.users.note.read
returnsNoteText false
noteTextReturned false
writesStillBlocked true
```

Wichtig: Selbst bei erlaubter Permission darf RDAP19 noch keine Notiztexte liefern. RDAP19 prueft nur, ob eine spaetere Display-Route berechtigt waere.

## Geplante technische Pruef-Reihenfolge

```text
1. Session read-only validieren.
2. UserUid aus Session bestimmen.
3. Dashboard-Zugriff pruefen.
4. Permission admin.users.note.read fuer actor/userUid pruefen.
5. Ziel-UserUid syntaktisch validieren.
6. DB-/Tabellenstatus nur lesend pruefen.
7. Ergebnis als Diagnostic-JSON ausgeben.
8. Keine Notiztexte laden.
9. Keine Audit-/Lock-/Write-Aktion ausfuehren.
```

## Geplante Antwortfelder

```json
{
  "service": "remote-modboard",
  "module": "remote_admin_user_admin_note_read_permission_diagnostic",
  "diagnosticBuild": "RDAP_ADMIN_USERS19_AUTH_PERMISSION_READ_CHECK_READONLY",
  "statusApiVersion": "rdap_admin_users19.v1",
  "readOnly": true,
  "routeRemainsReadOnly": true,
  "prepared": true,
  "route": "/api/remote/admin/users/admin-note-read-permission-diagnostic",
  "targetUserUid": "test",
  "permissionKey": "admin.users.note.read",
  "loggedIn": false,
  "dashboardAccess": false,
  "canReadAdminNotes": false,
  "returnsNoteText": false,
  "noteTextReturned": false,
  "writesStillBlocked": true,
  "writeEnabled": false,
  "productiveWritesEnabled": false
}
```

## Spaetere echte Display-Route erst nach RDAP19

Eine spaetere Route wie:

```http
GET /api/remote/admin/users/admin-note-display?targetUserUid=test
```

darf erst Notiztexte liefern, wenn RDAP19 erfolgreich getestet und dokumentiert wurde.

Pflichtbedingungen:

```text
Session valid
Actor eindeutig
Dashboard-Zugriff erlaubt
Permission admin.users.note.read erlaubt
Direkter API-Aufruf ohne Permission blockiert
Keine Ausgabe auf Community-Seiten
Keine Schreibbuttons
Keine Writes
```

## Tests fuer den naechsten Code-Step

Nach technischer Umsetzung von RDAP19:

```bash
curl -fsS "http://127.0.0.1:3010/api/remote/admin/users/admin-note-read-permission-diagnostic?targetUserUid=test" | jq

curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.adminUserAdminNoteReadPermissionDiagnostic'
```

Erwartung:

```text
readOnly true
permissionKey admin.users.note.read
returnsNoteText false
noteTextReturned false
writesStillBlocked true
writeEnabled false
productiveWritesEnabled false
```

## Ergebnis von RDAP19

RDAP19 ist erfolgreich, wenn dokumentiert ist:

```text
admin.users.note.read ist die Pflicht-Permission fuer spaetere echte Notiztext-Anzeige.
RDAP19 selbst gibt keine Notiztexte zurueck.
RDAP19 selbst schreibt nichts.
Community-Seiten bleiben ausgeschlossen.
Der naechste Code-Step darf nur eine read-only Permission-Diagnostic bauen.
```
