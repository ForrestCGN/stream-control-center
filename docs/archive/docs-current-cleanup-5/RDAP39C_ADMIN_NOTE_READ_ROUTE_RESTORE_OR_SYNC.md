# RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC

Datum: 2026-06-25  
Projekt: `stream-control-center` / Remote-Modboard / RDAP  
Typ: Backend-Sync/Restore fuer Admin-Notizen-Readroute

## Zweck

RDAP39C synchronisiert den dokumentierten RDAP27/RDAP28-Read-Stand wieder sauber in den aktuellen Repo-Code.

Befund vor RDAP39C:

```text
Das Frontend-Asset `/assets/rdap28-admin-notes.js` ruft:
GET /api/remote/admin/users/admin-notes/read?targetUserUid=...

In `remote-modboard/backend/src/routes/admin-users.routes.js` war diese Route im aktuellen Arbeitsstand aber nicht registriert.
```

Damit konnte RDAP40 nicht sauber vorbereitet werden, weil die Create-UI nach einem erfolgreichen Write die Notizliste nicht verlaesslich per Readback/Refresh aktualisieren kann.

## Geaendert

```text
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/routes/routes.routes.js
```

## Restore-Inhalt

```text
GET /api/remote/admin/users/admin-notes/read
```

wird wieder ueber den bestehenden/gelieferten Service registriert:

```text
buildAdminUserAdminNoteRealReadAuthed
```

Service-Build:

```text
RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
statusApiVersion: rdap_admin_users27.v1
```

`/api/remote/routes` dokumentiert die Read-Route jetzt wieder explizit ueber `adminNoteReadRestored`.

## Sicherheitsgrenzen

```text
Readroute bleibt read-only.
Schreibt keine Daten.
Fuehrt keine Migration aus.
Aktiviert keine UI-Schreibbuttons.
Erfordert gueltige Session.
Erfordert DashboardAccess.
Erfordert admin.users.note.read.
Community-Seiten duerfen Admin-Notizen weiterhin nicht lesen.
```

## Nicht geaendert

```text
Create-Route bleibt RDAP39.
Update bleibt deaktiviert.
Deactivate bleibt deaktiviert.
Physisches Delete bleibt verboten.
Keine Permission-Vergabe in der UI.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control.
Keine DB-Migration.
Keine Workflow-Tools geaendert.
```

## Tests lokal

```powershell
cd D:\Git\stream-control-center
node --check .\remote-modboard\backend\src\routes\admin-users.routes.js
node --check .\remote-modboard\backend\src\routes\routes.routes.js
node --check .\remote-modboard\backend\src\services\admin-user-admin-note-real-read-authed.service.js
git status --short
git diff --stat
```

## Tests nach Webserver-Deploy

Deploy wie RDAP-Standard aus frischem GitHub/dev-Clone:

```bash
cd /opt/stream-control-center/_deploy_tmp
rm -rf RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC
git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC
cd RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC
sudo bash tools/remote-modboard-deploy.sh RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC dev
```

Danach pruefen:

```bash
curl -fsS http://127.0.0.1:3010/api/remote/routes | jq '.statusApiVersion, .adminNoteReadRestored'
```

Browser-/Session-Readtest mit gueltiger Session:

```text
GET https://mods.forrestcgn.de/api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954
```

Erwartung:

```text
ok: true
reason: admin_note_real_read_ready
canReadAdminNotes: true
notes enthaelt die RDAP39-Testnotiz
```

## Naechster sinnvoller Step

```text
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
```

RDAP40 kann danach sauber auf bestehende Readback-/Refresh-Logik aufbauen.
