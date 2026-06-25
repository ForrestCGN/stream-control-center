# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP40

Du arbeitest im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Pflicht zuerst lesen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC.md
docs/current/RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED.md
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
RDAP39C_ADMIN_NOTE_READ_ROUTE_RESTORE_OR_SYNC ist live bestaetigt.
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED wurde vorbereitet.
```

RDAP39C Live-Bestaetigung:

```text
GET /api/remote/admin/users/admin-notes/read?targetUserUid=tw:127709954
ok: true
reason: admin_note_real_read_ready
canReadAdminNotes: true
notes: 2
```

RDAP40 UI:

```text
Datei: remote-modboard/backend/public/assets/rdap28-admin-notes.js
Create-Button nur sichtbar, wenn admin.users.note.write serverseitig erkennbar erlaubt ist.
POST /api/remote/admin/users/admin-notes/create
Body-confirmWrite true
Nach Erfolg Refresh ueber GET /api/remote/admin/users/admin-notes/read
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

Nach lokalem Test, stepdone und Webserver-Deploy:

```text
RDAP40B_ADMIN_NOTE_CREATE_UI_LIVE_CONFIRMED_DOCS
```

RDAP40B soll nur dokumentieren:

```text
- RDAP40 live deployed.
- UI-Create-Button sichtbar/nicht sichtbar wie erwartet.
- Test-Create ueber UI erfolgreich oder Fehler dokumentiert.
- Readback/Refresh nach Create bestaetigt.
- Keine Update/Deactivate/Delete Buttons sichtbar.
```
