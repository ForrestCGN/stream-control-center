# RDAP_ADMIN_USERS21_ADMIN_NOTE_DISPLAY_READINESS_PLAN

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard  
Typ: Readiness-/UI-Plan fuer spaetere Admin-Notiz-Anzeige

## Zweck

RDAP21 legt fest, wann und wie Admin-Notizen spaeter im Remote-Modboard angezeigt werden duerfen.

Dieser Step ist bewusst nur ein Plan-/Readiness-Step.

## Grundlage

Bestaetigter Stand aus RDAP20B:

```text
GET /api/remote/admin/users/admin-note-read-permission-diagnostic?targetUserUid=test

Unauthentifiziert:
HTTP/1.1 401 Unauthorized
ok: false
loggedIn: false
dashboardAccess: false
canReadAdminNotes: false
reason: not_logged_in_or_session_invalid
readOnly: true
writesStillBlocked: true
returnsNoteText: false
noteTextReturned: false
noteTextIsRedacted: true
communityPagesMayReadAdminNotes: false
```

RDAP16 bleibt DB-Grundlage:

```text
Tabelle: dashboard_user_admin_notes
tableExists: true
schemaReady: true
migrationRequired: false
rowCount: 0
```

## Harte Anzeige-Regel

Echte Admin-Notiztexte duerfen erst angezeigt werden, wenn alle Bedingungen gleichzeitig erfuellt sind:

```text
1. Auth/Login aktiv und gueltig
2. Session vorhanden und gueltig
3. User ist Dashboard-/Modboard-berechtigt
4. Server prueft konkrete Permission: admin.users.note.read
5. Ziel-User ist eindeutig
6. Request bleibt read-only
7. Response wird nicht auf Community-Seiten verwendet
8. Audit-/Log-Konzept fuer spaetere produktive Anzeige ist geklaert, falls erforderlich
```

Ohne diese Bedingungen bleibt die Anzeige blockiert oder redacted.

## Permission-Regel

Lesen und Schreiben bleiben strikt getrennt:

```text
admin.users.note.read
→ erlaubt spaeter nur das Lesen/Anzeigen interner Admin-Notizen

admin.users.note.write
→ spaeter separater Write-Scope fuer Erstellen/Aendern/Deaktivieren
```

`admin.users.note.read` darf niemals automatisch `admin.users.note.write` bedeuten.

## Erlaubte spaetere UI fuer ersten Anzeige-Step

Der erste echte UI-Step darf hoechstens eine read-only Anzeige im internen Admin-User-Bereich vorbereiten.

Erlaubt:

```text
- Admin-/User-Detailbereich
- read-only Karte/Panel "Interne Admin-Notizen"
- Anzeige nur nach serverseitiger Auth-/Permission-Freigabe
- leerer Zustand, wenn keine Notizen existieren
- redacted/blocked Zustand, wenn Permission fehlt
- klare Anzeige: "Keine Berechtigung" oder "Login erforderlich"
```

Nicht erlaubt:

```text
- Notiz erstellen
- Notiz bearbeiten
- Notiz loeschen
- Status aendern
- UI-Schreibbuttons
- Inline-Editor
- Formular
- produktiver POST/PUT/PATCH/DELETE
```

## Community-Seiten-Regel

Admin-Notizen sind interne Dashboard-/Modboard-Daten.

Community-Seiten unter `forrestcgn.de` oder `.info` duerfen Admin-Notizen niemals lesen, ausgeben, zwischenspeichern oder per API durchreichen.

Erlaubt auf Community-Seiten ist spaeter hoechstens:

```text
- eingeloggter User sieht Dashboard-/Modboard-Link, wenn Rolle/Recht passt
```

Nicht erlaubt:

```text
- Admin-Notiztexte
- Admin-Notiz-Count, wenn daraus interne Moderationsinformationen ableitbar sind
- interne User-Flags ohne ausdruecklichen Scope
```

## API-Regel fuer spaetere echte Anzeige

Eine spaetere echte Anzeige-Route darf nicht die bestehende Diagnostic ersetzen.

Moeglicher spaeterer Endpoint:

```text
GET /api/remote/admin/users/:targetUserUid/admin-notes
```

oder vorsichtiger:

```text
GET /api/remote/admin/users/admin-note-display-readonly?targetUserUid=...
```

Pflichtverhalten:

```text
- Auth erforderlich
- gueltige Session erforderlich
- admin.users.note.read erforderlich
- read-only
- keine DB-Writes
- keine Session-Writes, solange Session-Write-Scope nicht separat freigegeben ist
- keine Notiztexte bei fehlender Permission
- klare 401/403/200-Abgrenzung
```

Empfohlene Statuscodes:

```text
401: nicht eingeloggt / keine gueltige Session
403: eingeloggt, aber keine Permission admin.users.note.read
200: Permission vorhanden, read-only Anzeige erlaubt
```

## Response-Regel

Bei erlaubter Anzeige spaeter:

```json
{
  "ok": true,
  "readOnly": true,
  "targetUserUid": "...",
  "canReadAdminNotes": true,
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

Bei blockierter Anzeige:

```json
{
  "ok": false,
  "readOnly": true,
  "canReadAdminNotes": false,
  "returnsNoteText": false,
  "noteTextIsRedacted": true,
  "reason": "not_logged_in_or_session_invalid"
}
```

## Readiness-Checkliste vor echtem Anzeige-Code

Vor RDAP22 oder spaeterem Code-Step pruefen:

```text
[ ] aktuelle echte Dateien aus GitHub/dev pruefen
[ ] admin-users.routes.js pruefen
[ ] routes.routes.js pruefen
[ ] auth/session/permission helper pruefen
[ ] bestehendes User-Detail-/Admin-UI-Muster pruefen
[ ] keine alten project-state Dateien ueber neue Staende schreiben
[ ] konkrete Tests fuer 401/403/200 definieren
[ ] sicherstellen, dass keine Notiztexte ohne Permission ausgegeben werden
```

## Nicht geaendert durch RDAP21

```text
Keine Backend-Code-Aenderung
Keine DB-Aenderung
Keine SQL-Ausfuehrung
Keine Migration
Keine Admin-Notiz-Writes
Keine Notiztext-Ausgabe
Keine UI-Aenderung
Keine UI-Schreibbuttons
Keine User-/Rollen-/Session-Aenderung
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
Keine Workflow-Tool-Aenderung
```

## Naechster sinnvoller Schritt

Nach RDAP21 und separatem Go:

```text
RDAP22_ADMIN_NOTE_DISPLAY_READONLY_PLAN_OR_DIAGNOSTIC
```

Empfehlung: zuerst ein weiterer Diagnostic-/Readiness-Code-Step, der 401/403 sauber abgrenzt, bevor echte Notiztexte geliefert werden.
