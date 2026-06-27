# RDAP_ADMIN_USERS22_ADMIN_NOTE_REAL_READ_ROUTE_PLAN

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard  
Typ: Plan-Step fuer spaetere echte Admin-Notiz-Read-Route

## Zweck

RDAP22 plant die spaetere echte read-only Anzeige von Admin-Notizen im internen Remote-Modboard.

Dieser Step baut bewusst noch keinen Backend-Code, keine UI und keine Ausgabe echter Notiztexte, weil Auth/Session/Permission fuer echte Anzeige noch nicht aktiv testbar bestaetigt ist.

## Grundlage

Bestaetigter Stand:

```text
RDAP16: Tabelle dashboard_user_admin_notes existiert, schemaReady true, rowCount 0.
RDAP17/17B: Read-Diagnostic funktioniert und ist in /api/remote/routes sichtbar.
RDAP20: Permission-Diagnostic live, unauthentifiziert korrekt HTTP 401.
RDAP21: Display-Readiness geplant.
```

RDAP20B bestaetigt:

```text
GET /api/remote/admin/users/admin-note-read-permission-diagnostic?targetUserUid=test
Unauthentifiziert: HTTP/1.1 401 Unauthorized
canReadAdminNotes: false
reason: not_logged_in_or_session_invalid
returnsNoteText: false
noteTextIsRedacted: true
communityPagesMayReadAdminNotes: false
```

## Harte Regel fuer echte Notiztexte

Echte Admin-Notiztexte duerfen erst ausgegeben werden, wenn alle Bedingungen gleichzeitig erfuellt sind:

```text
1. Auth/Login ist aktiv.
2. Eine gueltige Session ist vorhanden.
3. Der eingeloggte User hat Dashboard-/Modboard-Zugriff.
4. Der Server prueft admin.users.note.read.
5. admin.users.note.read ist positiv.
6. targetUserUid ist eindeutig und valide.
7. Request bleibt read-only.
8. Keine Community-Seite liest oder proxyt diese Daten.
```

Ohne diese Bedingungen bleibt die Antwort blockiert oder redacted.

## Geplanter spaeterer Endpoint

Empfohlener spaeterer Endpoint fuer echte interne Anzeige:

```text
GET /api/remote/admin/users/:targetUserUid/admin-notes
```

Alternative, falls die vorhandene Admin-User-Routenstruktur besser dazu passt:

```text
GET /api/remote/admin/users/admin-note-display-readonly?targetUserUid=...
```

Die Entscheidung darf erst im Code-Step fallen, nachdem die echte Routenstruktur erneut aus GitHub/dev geprueft wurde.

## Pflichtverhalten der spaeteren echten Read-Route

```text
401: keine gueltige Session / nicht eingeloggt
403: eingeloggt, aber ohne admin.users.note.read
200: gueltige Session und admin.users.note.read vorhanden
```

Bei 401/403 gilt zwingend:

```text
returnsNoteText: false
noteTextReturned: false
noteTextIsRedacted: true
notes: []
```

Bei 200 darf die Route nur read-only Daten liefern:

```json
{
  "ok": true,
  "readOnly": true,
  "targetUserUid": "...",
  "canReadAdminNotes": true,
  "returnsNoteText": true,
  "notes": [
    {
      "noteUid": "...",
      "status": "active",
      "noteText": "...",
      "createdByUserUid": "...",
      "updatedByUserUid": "...",
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

## Permission-Regel

```text
admin.users.note.read  = nur lesen/anzeigen
admin.users.note.write = spaeterer separater Write-Scope
```

`admin.users.note.read` darf niemals Schreibrechte geben.

## UI-Regel fuer spaeter

Die erste UI darf hoechstens ein internes read-only Panel im Admin-User-Bereich sein.

Erlaubt:

```text
- Karte/Panel "Interne Admin-Notizen"
- leerer Zustand bei 0 Notizen
- 401/403-Zustand ohne Notiztexte
- reine Anzeige bei 200 + Permission
```

Nicht erlaubt:

```text
- Erstellen
- Bearbeiten
- Loeschen
- Status aendern
- Formular
- Inline-Editor
- POST/PUT/PATCH/DELETE
- UI-Schreibbuttons
```

## Community-Seiten-Regel

Community-Seiten unter `forrestcgn.de` oder `.info` duerfen Admin-Notizen niemals lesen, anzeigen, zwischenspeichern oder durchreichen.

Erlaubt ist dort spaeter hoechstens ein Dashboard-/Modboard-Link, wenn Rolle/Recht passt.

## Code-Step-Voraussetzungen

Vor einem echten RDAP23-Code-Step muessen erneut geprueft werden:

```text
[ ] aktuelle admin-users.routes.js aus GitHub/dev
[ ] aktuelle routes.routes.js aus GitHub/dev
[ ] aktuelle Auth-/Session-/Permission-Services
[ ] bestehende User-Detail-/Admin-UI-Dateien
[ ] ob Auth/Session im Remote-Modboard aktiv testbar ist
[ ] ob 401/403/200 sauber getestet werden kann
[ ] ob Notiztexte nur bei admin.users.note.read ausgegeben werden
```

## Nicht geaendert durch RDAP22

```text
Keine Backend-Code-Aenderung
Keine UI-Aenderung
Keine DB-Aenderung
Keine SQL-Ausfuehrung
Keine Migration
Keine Admin-Notiz-Writes
Keine Notiztext-Ausgabe
Keine UI-Schreibbuttons
Keine User-/Rollen-/Session-Aenderung
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
Keine Workflow-Tool-Aenderung
```

## Naechster sinnvoller Schritt

Nach RDAP22 und separatem Go:

```text
RDAP23_ADMIN_NOTE_REAL_READ_ROUTE_PREP_OR_AUTH_BLOCKER_CHECK
```

Empfehlung:

```text
Wenn Auth/Session noch nicht aktiv testbar ist:
  zuerst Auth-/Session-Blocker dokumentieren und keinen echten Text-Endpoint bauen.

Wenn Auth/Session aktiv testbar ist:
  kleine echte read-only Route bauen, die 401/403/200 sauber trennt und nur bei admin.users.note.read Notiztexte liefert.
```
