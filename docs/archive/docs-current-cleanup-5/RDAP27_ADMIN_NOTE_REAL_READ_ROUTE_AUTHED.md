# RDAP27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED

Stand: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard  
Typ: Backend-Step, echte read-only Admin-Notiz-Route mit Auth/Session/Permission

---

## 1. Zweck

RDAP27 baut erstmals eine echte read-only Route, die Admin-Notiztexte zurueckgeben darf.

Neue Route:

```text
GET /api/remote/admin/users/admin-notes/read?targetUserUid=<USER_UID>
```

Beispiel:

```text
GET /api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954
```

---

## 2. Sicherheitsmodell

RDAP27 liefert Notiztexte nur, wenn serverseitig alle Bedingungen erfuellt sind:

```text
gueltige Session
Dashboard-Zugriff erlaubt
DB-Permission admin.users.note.read effectivePermissionWouldAllow true
Admin-Notiz-Tabelle vorhanden
Admin-Notiz-Schema bereit
```

Wichtig fuer Option B:

```text
Allowlist-Owner reicht NICHT fuer Admin-Notiz-Lesen.
Fuer Admin-Notiz-Lesen zaehlt nur die echte DB-Permission admin.users.note.read.
```

Damit bleibt die Entscheidung "Option B bitte, direkt richtig" umgesetzt.

---

## 3. Was die Route nicht macht

```text
Keine Admin-Notiz-Erstellung
Keine Admin-Notiz-Aenderung
Keine Admin-Notiz-Loeschung
Keine Permission admin.users.note.write
Keine UI-Schreibbuttons
Keine Community-Seiten-Anbindung
Keine Agent-Actions
Keine OBS-/Sound-/Overlay-/Command-Steuerung
Keine DB-Writes
Keine Session-Writes
Keine last_seen_at Updates
```

---

## 4. Geaenderte Dateien

```text
remote-modboard/backend/server.js
remote-modboard/backend/package.json
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
docs/current/RDAP27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED.md
```

---

## 5. Antwortverhalten

### Ohne gueltige Session

```text
HTTP 401
reason: not_logged_in_or_session_invalid
noteTextReturned: false
```

### Ohne targetUserUid

```text
HTTP 400
reason: missing_or_invalid_target_user_uid
noteTextReturned: false
```

### Ohne Dashboard-Zugriff

```text
HTTP 403
reason: dashboard_access_denied
noteTextReturned: false
```

### Ohne DB-Permission admin.users.note.read

```text
HTTP 403
reason: admin_note_read_permission_denied
noteTextReturned: false
```

### Mit Session + DashboardAccess + admin.users.note.read

```text
HTTP 200
reason: admin_note_real_read_ready
noteTextReturned: true
noteTextIsRedacted: false
notes: [...]
```

Wenn aktuell keine Notizen fuer den Zieluser existieren:

```text
HTTP 200
notes: []
targetSummary.totalCount: 0
```

---

## 6. Test nach Deploy

Service/Routes:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/status | jq '.moduleBuild, .writeEnabled, .actionEnabled, .productiveAgentRuntime'

curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminUserAdminNoteRealReadAuthed'
```

Erwartung:

```text
moduleBuild: RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
statusApiVersion: rdap_admin_users27.v1
adminUserAdminNoteRealReadAuthed.prepared: true
adminUserAdminNoteRealReadAuthed.requiresEffectiveReadPermission: true
adminUserAdminNoteRealReadAuthed.allowlistOwnerDoesNotGrantAdminRead: true
```

Ohne Browser-Session per curl:

```bash
curl -sS -i 'http://127.0.0.1:3010/api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954'
```

Erwartung:

```text
HTTP/1.1 401 Unauthorized
reason: not_logged_in_or_session_invalid
```

Im eingeloggten Browser:

```text
https://mods.forrestcgn.de/api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954
```

Erwartung:

```text
ok: true
loggedIn: true
dashboardAccess: true
canReadAdminNotes: true
permissions.effectiveReadPermissionWouldAllow: true
noteTextReturned: true
notes: []
```

`notes: []` ist korrekt, solange fuer den Zieluser noch keine Admin-Notiz existiert.

---

## 7. Naechster Step

Nach erfolgreichem Live-Test:

```text
RDAP27B_ADMIN_NOTE_REAL_READ_ROUTE_LIVE_CONFIRMED_DOCS
```

Danach:

```text
RDAP28_ADMIN_NOTE_READONLY_UI_PANEL
```

RDAP28 waere eine read-only Dashboard-Anzeige ohne Schreibbuttons.
