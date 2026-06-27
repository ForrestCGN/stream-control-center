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
16. Deploy-Script kopiert nur `remote-modboard/` live.

## Zuerst aus GitHub/dev lesen

Bitte zu Beginn wirklich lesen:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP61B.md
docs/current/RDAP61B_ADMIN_NOTE_UPDATE_BACKEND_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP61_ADMIN_NOTE_UPDATE_BACKEND_IMPLEMENTATION.md
docs/current/RDAP60_ADMIN_NOTES_UPDATE_DEACTIVATE_SCOPE_PLAN.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

Fuer RDAP62 Status-Semantik-Code zusaetzlich pruefen:

```text
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/app.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
remote-modboard/backend/src/routes/admin-users.routes.js
```

## Aktueller bestaetigter Stand

RDAP61B ist abgeschlossen und auf GitHub/dev getestet/committed/pushed.

RDAP61B war Doku-only / Live-Confirmed-Docs.

RDAP61 ist live deployed und bestaetigt:

```text
POST /api/remote/admin/users/admin-notes/update ist Backend-confirmed aktiv.
adminNoteUpdateConfirmed.prepared: true
adminNoteUpdateConfirmed.writeEnabled: true
adminNoteUpdateConfirmed.productiveWritesEnabled: true
adminNoteUpdateConfirmed.adminNoteUpdateEnabled: true
adminNoteUpdateConfirmed.adminNoteCreateStillEnabled: true
adminNoteUpdateConfirmed.adminNoteDeactivateEnabled: false
adminNoteUpdateConfirmed.uiWriteButtonsEnabled: false
adminNoteUpdateConfirmed.frontendUpdateUiPrepared: false
adminNoteUpdateConfirmed.physicalDeleteEnabled: false
adminNoteUpdateConfirmed.communityPagesMayReadAdminNotes: false
adminNoteUpdateConfirmed.activeNotesOnly: true
adminNoteUpdateConfirmed.rawNoteTextLogged: false
```

Disabled-Service live:

```text
adminUsersAdminNoteWriteDisabled.routes enthaelt nur noch:
/api/remote/admin/users/admin-notes/deactivate

previouslyDisabledRouteNowConfirmed:
/api/remote/admin/users/admin-notes/update
```

## Wichtig: bekannter Follow-up

Im Live-Status gibt es noch aeltere RDAP42-Status-/Hinweistexte, die pauschal sagen, dass Update deaktiviert sei.

Beispiele:

```text
auth.notes: Admin-Notiz Update/Deactivate/Delete bleiben deaktiviert.
adminNoteUiStatusSemantics.adminNoteUpdateEnabled: false
adminNoteUiStatusSemantics.notes: Update, Deactivate und Delete bleiben deaktiviert.
```

Das ist nach RDAP61 nicht mehr sauber, weil Update-Backend jetzt live aktiv ist.

## Naechster empfohlener Step

```text
RDAP62_ADMIN_NOTE_UPDATE_STATUS_SEMANTICS_CLEANUP
```

## Ziel RDAP62

Nur Status-/Routen-Semantik nach RDAP61 bereinigen.

RDAP62 soll:

```text
- /api/remote/status nicht mehr pauschal sagen lassen, Update sei deaktiviert.
- Create-UI und Update-Backend klar trennen.
- Update-Backend als aktiv anzeigen.
- Update-UI weiterhin als nicht gebaut anzeigen.
- Deactivate/Delete weiterhin als deaktiviert anzeigen.
- Community-Read weiterhin als verboten anzeigen.
```

RDAP62 soll nicht bauen:

```text
Keine Update-UI.
Kein Deactivate.
Kein Delete.
Keine DB-Migration.
Keine neue Permission.
Keine Rollen-/Gruppen-/Permission-Writes.
Keine Community-Read-Freigabe.
Keine Agent/OBS/Sound/Overlay/Command/Channelpoints-Control.
Keine freie Shell-/Datei-/Prozess-/URL-Ausfuehrung.
```

## Start im neuen Chat

1. Die oben genannten Dateien aus GitHub/dev wirklich lesen.
2. Kurz bestaetigen, dass RDAP61 live und RDAP61B dokumentiert ist.
3. RDAP62 als Status-Semantik-Cleanup kurz planen.
4. Auf `go` warten.
