# NEXT_STEPS

Stand: RDAP41_ADMIN_NOTE_UI_STATUS_CLEANUP_PLAN  
Datum: 2026-06-25

## Naechster empfohlener Step

```text
RDAP41B_ADMIN_NOTE_STATUS_SEMANTICS_CLEANUP
```

## Ziel RDAP41B

```text
Die Status-/Routes-Summary soll nach RDAP40 semantisch sauber formuliert werden.
Aktuell zeigt adminNoteWriteConfirmed noch uiWriteButtonsEnabled: false, obwohl RDAP40 bewusst einen Create-Button fuer write-berechtigte Admins vorbereitet und live bestaetigt hat.
```

## Problem

```text
adminNoteWriteConfirmed.uiWriteButtonsEnabled: false ist nicht mehr sauber eindeutig.
Der Wert stammt aus RDAP39 und meinte: Der Backend-Write aktiviert nicht automatisch UI-Schreibbuttons.
Nach RDAP40 gibt es aber absichtlich einen UI-Create-Button, sichtbar nur bei admin.users.note.write.
```

## Gewuenschte Status-Semantik

```text
backendAutoUiWriteButtonsEnabled: false
adminNoteCreateUiPrepared: true
adminNoteCreateButtonVisibleForWritePermission: true
adminNoteUpdateUiPrepared: false
adminNoteDeactivateUiPrepared: false
adminNoteDeleteUiPrepared: false
```

## RDAP41B Grundregeln

```text
Keine neue Schreibfunktion.
Keine DB-Migration.
Keine Permission-Vergabe.
Keine UI-Erweiterung fuer Update/Deactivate/Delete.
Keine Community-Seiten-Anbindung.
Nur Status-/Routes-Summary und Doku sauberziehen.
```

## Vor RDAP41B zuerst echte Dateien pruefen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP41_ADMIN_NOTE_UI_STATUS_CLEANUP_PLAN.md
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/status.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
```

## Alternative nach Status-Cleanup

```text
RDAP42_ADMIN_NOTE_TARGET_USER_SELECTION_PLAN
```

Ziel waere Planung fuer echte Admin-User-Detailseite bzw. Zieluser-Auswahl statt fixem Zieluser `tw:127709954`.

## Workflow

```text
Plan nennen.
Auf Forrests "go" warten.
ZIP mit echten Zielpfaden bauen.
Lokal installstep.
Lokale Checks.
stepdone.
Bei Backend/UI-Aenderung danach Webserver-Deploy aus frischem GitHub/dev-Clone.
Readiness abwarten.
Tests ausgeben.
Doku-only braucht keinen Webserver-Deploy.
```
