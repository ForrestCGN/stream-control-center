# NEXT_STEPS

Stand: RDAP42B_ADMIN_NOTE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-25

## Naechster empfohlener Step

```text
RDAP43_ADMIN_USER_DETAIL_TARGET_SELECTION_PLAN
```

## Ziel RDAP43

```text
Admin-Notizen sollen nicht dauerhaft nur am fixen Zieluser tw:127709954 haengen.
RDAP43 soll zuerst planen, wie Admin-User-Detailseite oder Zieluser-Auswahl sauber aufgebaut wird.
```

## RDAP43 Grundregeln

```text
Erst planen, dann auf Forrests go warten.
Keine Update-/Deactivate-/Delete-Funktion.
Keine Permission-Vergabe in der UI.
Keine Community-Seiten-Anbindung an Admin-Notizen.
Keine freien technischen Eingaben fuer kritische User-/Permission-Aktionen.
Keine neue parallele UI-Struktur, wenn vorhandene Admin-/User-Struktur erweitert werden kann.
```

## Gewuenschte Richtung

```text
- Admin-Benutzerliste bzw. vorhandene User-Verwaltung als Einstieg nutzen.
- User auswaehlen.
- Admin-Notizen fuer genau diesen Zieluser anzeigen.
- Create fuer diesen Zieluser nur bei admin.users.note.write.
- Read nur bei admin.users.note.read.
- Zieluser sauber serverseitig pruefen.
```

## RDAP42 ist erledigt

```text
Status-/Routes-Semantik bereinigt.
/api/remote/routes und /api/remote/status live getestet.
statusApiVersion: rdap_admin_note_ui_status42.v1
uiWriteButtonsEnabled: true
backendAutoUiWriteButtonsEnabled: false
adminNoteCreateUiPrepared: true
adminNoteUpdateUiPrepared: false
newWriteFunctionEnabled: false
```

## Vor RDAP43 zuerst echte Dateien pruefen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP42B_ADMIN_NOTE_STATUS_SEMANTICS_LIVE_CONFIRMED_DOCS.md
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/index.html
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
```

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
