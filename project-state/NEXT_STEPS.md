# NEXT_STEPS

Stand: RDAP43_ADMIN_USER_DETAIL_NOTES_TARGET_SELECTION_PLAN  
Datum: 2026-06-25

## Naechster empfohlener Step

```text
RDAP44_ADMIN_NOTE_TARGET_USER_SELECTION_PREPARED
```

## Ziel RDAP44

```text
Admin-Notizen sollen nicht dauerhaft nur am fixen Zieluser tw:127709954 haengen.
RDAP44 soll die Zieluser-Auswahl oder eine kleine Admin-User-Detail-Anbindung umsetzen.
```

## Empfohlene kleine Umsetzung

```text
Admin-Notizen-Seite bekommt Zieluser-Auswahl aus vorhandener Benutzer-/Dashboard-Datenquelle.
Der fest verdrahtete Zieluser tw:127709954 wird durch den ausgewaehlten Zieluser ersetzt.
Read/Create bleiben dieselben Backend-Routen.
```

## RDAP44 Grundregeln

```text
Keine Update-Funktion.
Keine Deactivate-Funktion.
Kein Delete.
Keine Permission-Vergabe in diesem Step.
Keine Community-Seiten-Anbindung.
Keine DB-Migration ohne separaten Plan.
Keine parallele User-/Notizen-Struktur bauen, wenn vorhandene Admin-Struktur erweitert werden kann.
```

## Vor RDAP44 zuerst echte Dateien pruefen

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md
docs/current/RDAP43_ADMIN_USER_DETAIL_NOTES_TARGET_SELECTION_PLAN.md
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/assets/rdap28-admin-notes.js
remote-modboard/backend/public/index.html
remote-modboard/backend/src/routes/admin-users.routes.js
remote-modboard/backend/src/services/admin-user-admin-note-real-read-authed.service.js
remote-modboard/backend/src/services/admin-user-admin-note-write-confirmed.service.js
```

## Zu pruefen vor Code

```text
1. Gibt es bereits eine Admin-User-Liste/API, die fuer Auswahl genutzt werden kann?
2. Welche Userdaten sind im Frontend bereits vorhanden?
3. Kann rdap28-admin-notes.js dynamisch targetUserUid setzen?
4. Soll die Auswahl zuerst in Admin-Notizen oder direkt in Benutzerverwaltung sitzen?
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
