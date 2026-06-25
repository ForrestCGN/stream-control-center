# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP39C

Du arbeitest im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Pflicht zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Arbeitsweise

```text
Erst GitHub/dev und Doku pruefen.
Dann Plan nennen.
Dann auf ausdrueckliches "go" von Forrest warten.
Keine Funktionalitaet entfernen.
Keine funktionierenden Workflow-Tools ueberschreiben.
Keine Parallelstrukturen bauen.
Fehlende Dateien exakt anfordern.
ZIPs immer mit echten Zielpfaden ab Repo-Root.
Lokal: installstep -> Checks -> stepdone.
stepdone ist Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
Webserver-Deploy nur aus frischem GitHub/dev-Clone unter /opt/stream-control-center/_deploy_tmp/STEP_NAME.
Nach Service-Restart/Deploy Readiness abwarten.
Doku-only braucht keinen Webserver-Deploy.
```

## Aktueller Stand

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED ist live bestaetigt.
RDAP39B dokumentiert diesen Live-Stand.
RDAP39C stellt die fehlende echte Admin-Notiz-Readroute im Repo wieder her/synchronisiert sie.
```

RDAP39C relevante Route:

```text
GET /api/remote/admin/users/admin-notes/read
```

Service:

```text
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
buildAdminUserAdminNoteRealReadAuthed
moduleBuild: RDAP_ADMIN_USERS27_ADMIN_NOTE_REAL_READ_ROUTE_AUTHED
statusApiVersion: rdap_admin_users27.v1
```

RDAP39 weiterhin relevante Write-Route:

```text
POST /api/remote/admin/users/admin-notes/create
moduleBuild: RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED
statusApiVersion: rdap_admin_note_write39.v1
```

## Weiterhin verboten / deaktiviert

```text
Admin-Note Update
Admin-Note Deactivate
physisches Delete
Permission-Vergabe in der UI
Community-Seiten duerfen Admin-Notizen nicht lesen
Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrungen
Secrets im Frontend oder Audit
Raw note_text im Audit
```

## Naechster sinnvoller Step

```text
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
```

Ziel RDAP40:

```text
Admin-User/Admin-Notizen-Seite bekommt kontrollierten Create-Dialog/Button.
Button/Form nur sichtbar, wenn admin.users.note.write erlaubt ist.
Backend nutzt bestehende RDAP39-Create-Route.
confirmWrite bleibt serverseitig Pflicht.
Nach erfolgreichem Create: Readback/Refresh ueber RDAP39C-Readroute.
Kein Update.
Kein Deactivate.
Kein Delete.
Keine Community-Seiten-Anbindung.
Keine Permission-Vergabe in der UI.
```

Vor RDAP40 echte Dateien pruefen:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/index.html
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/routes/routes.routes.js
project-state/*
docs/current/*RDAP39C*
```
