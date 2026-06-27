Du bist im Projekt `stream-control-center` / Remote-Modboard / RDAP fuer ForrestCGN.

WICHTIG:
Halte dich strikt an die Arbeitsweise. Nicht raten, nicht blind bauen, keine parallelen Strukturen erfinden.

Arbeite Steps so gross wie moeglich, solange es sicher bleibt:
- Nicht unnoetig in Mini-Schritte zerlegen.
- Aber keine unsicheren Misch-Steps.
- Plan/Doku, Read-only-UI und Write-/DB-/Security-Scope sauber trennen.
- Keine Write-Freigaben nebenbei.
- Keine neue Route/DB-Migration ohne expliziten Plan.
- Bestehende Dateien/Module erweitern, wenn es fachlich passt.
- Neue Module nur, wenn bestehende Struktur wirklich nicht passt.

## Verbindliche Arbeitsweise

1. Immer zuerst GitHub/dev und echte Dateien pruefen.
2. Startdateien wirklich lesen, nicht nur erwaehnen.
3. Danach kurzen Plan nennen.
4. Auf Forrests explizites `go` warten.
5. Keine Funktionalitaet entfernen.
6. Bestehende Module/Services/Dateien erweitern, wenn es fachlich passt.
7. Neue Module nur erstellen, wenn bestehende Struktur wirklich nicht passt.
8. Keine Patch-/Regex-/Set-Content-Anweisungen liefern.
9. ZIPs immer mit echten Repo-Zielpfaden bauen.
10. Forrest laedt ZIPs in den Downloads-Ordner.
11. Lokal immer:
    - `installstep.cmd`
    - Checks
    - `git status`
    - `stepdone.cmd`
12. `stepdone.cmd` bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
13. Bei Backend-/Frontend-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone:
    cd /opt/stream-control-center/_deploy_tmp
    rm -rf STEP_NAME
    git clone --branch dev --single-branch https://github.com/ForrestCGN/stream-control-center.git STEP_NAME
    cd STEP_NAME
    sudo bash tools/remote-modboard-deploy.sh STEP_NAME dev
14. Kein zusaetzlicher manueller `systemctl restart` nach Deploy, das Deploy-Script macht Restart/Readiness.
15. Doku-only braucht keinen Webserver-Deploy.
16. `/opt/stream-control-center` ist kein Git-Repo.
17. Deploy-Script kopiert nur `remote-modboard/` live.
18. Leitlinie: so klein wie noetig, so gross wie sicher moeglich.

## Zuerst aus GitHub/dev lesen

Bitte zu Beginn wirklich lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP60.md
docs/current/RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN.md
docs/current/RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN.md
docs/current/RDAP58_PERMISSION_READ_DETAIL_WRAPUP_OR_NEXT_AREA_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer RDAP61/Admin-Note-Update-Code zusaetzlich pruefen:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-disabled.service.js
remote-modboard/backend/src/services/admin-confirm-write.service.js
remote-modboard/backend/src/services/admin-audit-write.service.js
remote-modboard/backend/src/services/admin-lock-write.service.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/app.js
```

## Aktueller bestaetigter Stand

RDAP60 ist abgeschlossen und auf GitHub/dev getestet/committed/pushed.

RDAP60 war Doku-only / Plan-only:

```text
Update und Deactivate werden nicht gemeinsam gebaut.
Zuerst soll nur Admin-Note Update als kleinster sinnvoller Write-Scope vorbereitet werden.
Deactivate bleibt danach ein separater Scope.
RDAP60 selbst hat keine Code-Aenderung, keine Route, keine DB, keine Writes gebaut.
```

## Aktueller Admin-Notes Stand

Bestehende Admin-Notes-Routen liegen in:

```text
remote-modboard/backend/src/routes/admin-users.routes.js
```

Routen:

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

Create ist bewusst vorbereitet/live.
Update und Deactivate sind weiter deaktiviert.
Physisches Delete bleibt verboten.
Community-Read bleibt verboten.

## RDAP60 Entscheidung fuer Update

Spaeterer erster Write-Ausbau soll nur Admin-Note Update betreffen.

Kleinster Update-Scope:

```text
targetUserUid
noteUid
noteText
confirmWrite: true
```

Serverseitig erlaubt:

```text
note_text = validierter noteText
updated_by_user_uid = actor.userUid
updated_at = now
```

Nur wenn:

```text
Notiz existiert.
Notiz gehoert zu targetUserUid.
Notiz status = active.
```

Nicht erlaubt:

```text
status aus Body
created_by_user_uid
created_at
updated_by_user_uid aus Body
updated_at aus Body
note_uid Aenderung
target_user_uid Aenderung
inactive/deactivated Notizen editieren
physisches Delete
Deactivate im selben Step
Community-Read
Permission-/Rollen-/Gruppen-Writes
```

Permission:

```text
admin.users.note.write
remote.view
DashboardAccess
valid session
```

Confirm:

```text
confirmWrite nur true im JSON-Body.
Query-/Header-/implizites Confirm bleibt verboten.
```

Lock:

```text
resourceType: admin_user_note
resourceKey: admin_user_note:<noteUid>
lockScope: admin.users.note:<targetUserUid>
```

Audit:

```text
action: admin.user_note.update
raw note_text niemals ins Audit
nur Textlaengen und sichere Metadaten
```

Readback:

```text
exists true
noteUid passt
targetUserUid passt
status active
noteTextLength passt
updatedByUserUid actor.userUid
updatedAt gesetzt
```

## Naechster empfohlener Step

```text
RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION
```

Wichtig:
RDAP61 darf nur den Update-Backend-Scope anfassen, wenn Forrest nach Startcheck und Plan explizit `go` gibt.

RDAP61 soll nicht bauen:

```text
Deactivate
Delete
Community-Read
Permission-/Rollen-/Gruppen-Verwaltung
Session-Revocation
Agent/OBS/Sound/Overlay/Command/Channelpoints-Control
freie Shell-/Datei-/Prozess-/URL-Ausfuehrung
```

## Start im neuen Chat

1. Die oben genannten Dateien aus GitHub/dev wirklich lesen.
2. Kurz bestaetigen, dass RDAP60 abgeschlossen ist.
3. RDAP61 als Backend-Update-Scope kurz planen.
4. Auf `go` warten.
