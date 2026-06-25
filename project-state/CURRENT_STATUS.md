# CURRENT_STATUS

Stand: RDAP30_ADMIN_NOTE_WRITE_SCOPE_PLAN  
Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard

## Produktiv

```text
URL: https://mods.forrestcgn.de/
Live-Pfad: /opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
```

## Aktueller bestaetigter Stand

### RDAP25 Login/OAuth/Session

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

### RDAP26 Option B Rollen/Permissions

```text
ForrestCGN / tw:127709954 -> Rolle owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
owner -> admin.users.note.write -> nicht vergeben
```

### RDAP27 echte read-only Admin-Notiztext-Route

```text
GET /api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954
Ohne Session: HTTP 401
Mit gueltiger Session + admin.users.note.read: HTTP 200
writeEnabled: false
canWriteAdminNotes: false
```

### RDAP28 read-only Admin-Notiz-UI

```text
Admin -> Admin-Notizen sichtbar
GET /assets/rdap28-admin-notes.js -> HTTP 200
Read true
Write false
Keine Schreibbuttons sichtbar
```

### RDAP29/RDAP29B MariaDB-Testnotiz live bestaetigt

```text
Live-DB: MariaDB 11.8.6
DB-Name: c3stream_control
Tabelle: dashboard_user_admin_notes
ForrestCGN user_uid: tw:127709954
note_count nach Seed: 1
note_uid: rdap29-test-note-forrestcgn-readonly-validation
Browser: 1 Admin-Notiz read-only geladen
```

### RDAP30 Write-Scope geplant

RDAP30 plant den ersten sinnvollen Write-Scope fuer Admin-Notizen:

```text
create note
update note_text
deactivate note
```

Nicht Teil des ersten Write-Scope:

```text
physisches DELETE
UI-Schreibbuttons
Permission-Vergabe
Community-Seiten-Anbindung
Bulk-Aktionen
User-/Rollen-/Session-Verwaltung
```

## Weiterhin blockiert

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
Audit-Inserts oder Audit-Updates ueber Dashboard
Lock acquire/heartbeat/release/force-takeover
Agent-Actions
OBS-/Sound-/Overlay-/Command-Steuerung
Community-Seiten-Anbindung fuer Admin-Notizen
```
