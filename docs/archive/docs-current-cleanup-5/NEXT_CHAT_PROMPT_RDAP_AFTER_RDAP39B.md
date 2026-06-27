# NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP39B

Du arbeitest im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

## Wichtigste Arbeitsweise

Lies zuerst diese Dateien wirklich und wende sie an:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Regeln:

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
Nach Service-Restart immer Readiness abwarten.
Doku-only braucht keinen Webserver-Deploy.
```

## Single Source

```text
GitHub: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Lokales Live: D:\Streaming\stramAssets
Webserver Subdomain: mods.forrestcgn.de
Remote-Modboard Live-Pfad: /opt/stream-control-center/remote-modboard
Service: scc-remote-modboard.service
DB: MariaDB 11.8.6, DB c3stream_control
DB-Client-Datei: /root/rdap29_mysql_client.cnf
```

## Aktueller bestaetigter RDAP-Stand

```text
RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED live bestaetigt.
RDAP39B_ADMIN_NOTE_WRITE_BACKEND_LIVE_CONFIRMED_DOCS dokumentiert.
```

Bestaetigt:

```text
POST /api/remote/admin/users/admin-notes/create
statusApiVersion: rdap_admin_note_write39.v1
moduleBuild: RDAP39_ADMIN_NOTE_WRITE_BACKEND_CONFIRMED
```

Erster kontrollierter produktiver Admin-Note-Create-Write war erfolgreich:

```text
note_uid: admin_note_20260625104920_5fec9726d7a3
target_user_uid: tw:127709954
created_by_user_uid: tw:127709954
status: active
writeExecuted: true
readBackFound: true
```

Audit:

```text
attempt: rdap39_admin_note_attempt_20260625104920_d3bf635c6d4e
success: rdap39_admin_note_success_20260625104920_9047246cdad5
```

Lock:

```text
lock_uid: rdap39_admin_note_lock_20260625104920_b185f1071a74
status: released
resource_key: admin_user_note:tw:127709954:create
```

Permissions wurden live ergaenzt:

```text
dashboard_permissions:
- remote.view
- admin.users.note.read
- admin.users.note.write

dashboard_role_permissions:
- owner -> remote.view -> allow
- owner -> admin.users.note.read -> allow
- owner -> admin.users.note.write -> allow
```

## Wichtige Sicherheitsgrenzen

```text
Admin-Note Create ist backendseitig produktiv bestaetigt.
Update bleibt deaktiviert.
Deactivate bleibt deaktiviert.
UI-Schreibbuttons sind noch deaktiviert.
Physisches Delete bleibt verboten.
Community-Seiten lesen keine Admin-Notizen.
Raw note_text wird nicht im Audit gespeichert.
Kein Agent/OBS/Sound/Overlay/Command/Channelpoints-Control in diesem Bereich.
Keine Secrets in Frontend/Audit.
```

## Naechster sinnvoller Step

Empfohlen:

```text
RDAP40_ADMIN_NOTE_CREATE_UI_PREPARED
```

Ziel:

```text
Admin-User-Detailseite bekommt kontrollierte UI-Vorbereitung fuer Create-Notiz.
Button/Form nur sichtbar, wenn admin.users.note.write erlaubt ist.
Serverseitig bleibt confirmWrite Pflicht.
Nach erfolgreichem Create muss die Notizliste/readback aktualisiert werden.
Kein Update.
Kein Deactivate.
Kein Delete.
```

Vor RDAP40 zuerst echte Dateien aus GitHub/dev lesen, besonders:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/frontend / dashboard Dateien fuer Admin-User-Detailseite suchen
```

Forrest will sichtbaren Fortschritt, aber keine riskanten Spruenge. Also kleiner UI-Step, klarer Plan, dann go abwarten.
