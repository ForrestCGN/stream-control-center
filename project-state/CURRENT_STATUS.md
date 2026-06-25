# CURRENT_STATUS

Stand: RDAP28B_ADMIN_NOTE_READONLY_UI_PANEL_LIVE_CONFIRMED_DOCS  
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

Forrest hat entschieden:

```text
Option B bitte, direkt richtig.
```

Live bestaetigt:

```text
ForrestCGN / tw:127709954 -> Rolle owner
owner -> remote.view -> allow
owner -> admin.users.note.read -> allow
owner -> admin.users.note.write -> nicht vergeben
```

Backup vor RDAP26-Seed:

```text
/opt/stream-control-center/_runtime_tmp/rdap_db_backups/rdap26_before_owner_permission_seed_20260625_080740.sql
```

Browser-/API-Test nach RDAP26:

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

### RDAP27 echte read-only Admin-Notiztext-Route

Live bestaetigt:

```text
moduleBuild: RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
writeEnabled: false
actionEnabled: false
productiveAgentRuntime: false

GET /api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954
```

Ohne Session:

```text
HTTP 401
reason: not_logged_in_or_session_invalid
noteTextReturned: false
```

Mit gueltiger Browser-Session:

```text
ok: true
loggedIn: true
dashboardAccess: true
canReadAdminNotes: true
reason: admin_note_real_read_ready
permissions.effectiveReadPermissionWouldAllow: true
permissions.readReason: explicit_allow
permissions.canWriteAdminNotes: false
permissions.effectiveWritePermissionWouldAllow: false
permissions.writeReason: no_matching_permission
tableExists: true
schemaReady: true
rowCount: 0
notes: []
```

### RDAP28 read-only Admin-Notiz-UI

Live bestaetigt:

```text
Admin -> Admin-Notizen sichtbar
GET /assets/rdap28-admin-notes.js -> HTTP 200
HTML enthaelt /assets/rdap28-admin-notes.js
```

Browser-Sicht:

```text
Read: true
Write: false
Notizen: 0
Tabelle: true
Keine Admin-Notizen vorhanden.
Neu laden Button sichtbar.
Keine Schreibbuttons sichtbar.
Sicherheitsbereich sichtbar.
```

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
Community-Seiten-Anbindung fuer Admin-Notizen
```

## Arbeitsweise, die zuletzt gut funktioniert hat

```text
Steps so gross wie moeglich und so klein wie noetig.
Keine kuenstlichen Mini-Schritte.
Bei go: echten naechsten Step bauen, nicht alles wiederholen.
Nach Stepdone: Wenn noetig Webserver-Deploy aus frischem GitHub/dev-Clone.
Bei Doku-only: kein Deploy.
Fehlende Dateien gezielt anfragen, nicht raten.
ZIPs ohne unnoetige Root-README-Dateien.
```
