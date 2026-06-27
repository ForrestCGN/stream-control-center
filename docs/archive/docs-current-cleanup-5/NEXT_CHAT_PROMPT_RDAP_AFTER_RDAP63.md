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
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP63.md
docs/current/RDAP63_ADMIN_NOTE_UPDATE_UI_SCOPE_PLAN.md
docs/current/RDAP62B_ADMIN_NOTE_UPDATE_STATUS_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP.md
docs/current/RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer RDAP64 Update-UI-Code zusaetzlich pruefen:

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

RDAP63 ist abgeschlossen und auf GitHub/dev getestet/committed/pushed.

RDAP63 war Doku-only / UI-Scope-Plan.

Bestaetigt:

```text
RDAP61: Admin-Note Update-Backend live aktiv.
RDAP62: Status-Semantik live bereinigt.
RDAP62B: Live-Befund dokumentiert.
RDAP63: Update-UI-Scope geplant, aber noch nicht gebaut.
```

Aktueller Admin-Notes Stand:

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> Backend confirmed aktiv
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

Bestehende UI-Datei:

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

Aktuell bestehend:

```text
- Admin-Notizen Navigation
- Zieluser-Auswahl
- Admin-Notizen Read-Liste
- Create-Button/Form bei Schreibrecht
- Create mit confirmWrite:true
- Reload nach erfolgreichem Create
```

Noch nicht gebaut:

```text
- Update-Button pro Notiz
- UPDATE_ENDPOINT
- Edit-Panel/Inline-Edit
- Update-Busy-State
- Update-Fehleranzeige
```

## Naechster empfohlener Step

```text
RDAP64_ADMIN_NOTE_UPDATE_UI_IMPLEMENTATION
```

## Ziel RDAP64

Nur bestehende Admin-Notes-UI erweitern.

RDAP64 darf:

```text
- UPDATE_ENDPOINT in rdap28-admin-notes.js ergaenzen.
- Bearbeiten-Button pro aktiver Notiz anzeigen.
- Nur bei erfolgreicher Readroute und Schreibrecht anzeigen.
- Inline-Edit oder kleines Edit-Panel in derselben Notizkarte bauen.
- noteText vorausfuellen.
- confirmWrite:true im JSON-Body senden.
- Busy-State setzen.
- Fehler sichtbar anzeigen.
- Nach Erfolg Readroute neu laden.
```

RDAP64 darf nicht:

```text
- Kein Deactivate.
- Kein Delete.
- Keine DB-Migration.
- Keine neue Permission.
- Keine Rollen-/Gruppen-/Permission-Writes.
- Keine Community-Read-Freigabe.
- Keine neue Backend-Route.
- Keine Agent/OBS/Sound/Overlay/Command/Channelpoints-Control.
- Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Start im neuen Chat

1. Die oben genannten Dateien aus GitHub/dev wirklich lesen.
2. Kurz bestaetigen, dass RDAP63 abgeschlossen ist.
3. RDAP64 als Update-UI-Implementation kurz planen.
4. Auf `go` warten.
