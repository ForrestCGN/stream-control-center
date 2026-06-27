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
11. Lokal immer: installstep.cmd -> Checks -> git status -> stepdone.cmd.
12. stepdone.cmd bedeutet Commit/Push nach GitHub/dev, nicht Webserver-Deploy.
13. Bei Backend-/Frontend-Code danach Webserver-Deploy aus frischem GitHub/dev-Clone.
14. Doku-only braucht keinen Webserver-Deploy.
15. `/opt/stream-control-center` ist kein Git-Repo.
16. Deploy-Script kopiert nur `remote-modboard/`.

## Zuerst aus GitHub/dev lesen

Bitte zu Beginn wirklich lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP62B.md
docs/current/RDAP62B_ADMIN_NOTE_UPDATE_STATUS_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP.md
docs/current/RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer einen moeglichen RDAP63 Update-UI-Scope zusaetzlich pruefen:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/app.js
```

## Aktueller bestaetigter Stand

RDAP62B ist abgeschlossen und auf GitHub/dev getestet/committed/pushed.

RDAP62B war Doku-only / Live-Confirmed-Docs.

RDAP62 ist live deployed und bestaetigt:

```text
/api/remote/status:
statusApiVersion = rdap_admin_note_update_status62.v1

auth.notes trennt jetzt:
- Create-Backend aktiv
- Create-UI vorbereitet
- Update-Backend aktiv
- Update-UI nicht gebaut
- Deactivate/Delete deaktiviert

adminNoteUiStatusSemantics:
adminNoteCreateBackendEnabled: true
adminNoteCreateUiPrepared: true
adminNoteUpdateBackendEnabled: true
adminNoteUpdateRoutePrepared: true
adminNoteUpdateUiPrepared: false
adminNoteDeactivateEnabled: false
adminNoteDeleteUiPrepared: false
physicalDeleteEnabled: false
communityPagesMayReadAdminNotes: false
newUiFunctionEnabled: false
```

`/api/remote/routes` bestaetigt weiterhin:

```text
adminNoteUpdateConfirmed.writeEnabled: true
adminNoteUpdateConfirmed.productiveWritesEnabled: true
adminNoteUpdateConfirmed.adminNoteUpdateEnabled: true
adminNoteUpdateConfirmed.frontendUpdateUiPrepared: false
adminNoteUpdateConfirmed.activeNotesOnly: true
adminNoteUpdateConfirmed.rawNoteTextLogged: false

adminUsersAdminNoteWriteDisabled.routes:
- /api/remote/admin/users/admin-notes/deactivate
```

## Aktueller Admin-Notes Stand

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Weiterhin verboten/deaktiviert

```text
Admin-Note Update-UI ist nicht gebaut.
Admin-Note Deactivate bleibt disabled.
Physisches Delete bleibt verboten.
Community-Read fuer Admin-Notizen bleibt verboten.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
Keine Agent-/OBS-/Sound-/Overlay-/Command-/Channelpoints-Steuerung.
```

## Naechster empfohlener Step

```text
RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN
```

## Ziel RDAP63

Nur Update-UI planen, nicht direkt bauen.

RDAP63 soll klaeren:

```text
- Wo der Update-Button in der bestehenden Admin-Notizen-UI erscheinen darf.
- Nur aktive Notizen.
- Nur fuer Admin-Read-Ansicht.
- Nur wenn Serverstatus/Permission/Readroute das erlauben.
- confirmWrite:true im JSON-Body.
- Keine Optimistic-Mutation.
- Nach Erfolg immer Readroute neu laden.
- Fehler sichtbar anzeigen.
- Kein Deactivate-Button.
- Kein Delete.
- Keine Community-/Profil-/Public-/Self-Service-Freigabe.
```

RDAP63 soll nicht bauen:

```text
Keine Update-UI-Implementierung ohne separaten go.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Community-Read-Freigabe.
Keine Agent/OBS/Sound/Overlay/Command/Channelpoints-Control.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

Alternative vor RDAP63:

```text
RDAP63_ADMIN_NOTE_UPDATE_BACKEND_LIVE_TEST_PLAN
```

Nur falls Forrest vor UI erst einen sehr vorsichtigen echten Backend-Update-Live-Test planen will.

## Start im neuen Chat

1. Die oben genannten Dateien aus GitHub/dev wirklich lesen.
2. Kurz bestaetigen, dass RDAP62 live und RDAP62B dokumentiert ist.
3. RDAP63 als Update-UI-Scope-Plan kurz planen.
4. Auf `go` warten.
