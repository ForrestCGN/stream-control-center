# FILES

Stand: RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN  
Datum: 2026-06-26

## Geaendert in RDAP46

```text
docs/current/RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP46.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Keine Code-Dateien in RDAP46

```text
RDAP46 ist Doku-/Plan-only.
Kein Backend-Code.
Kein Frontend-Code.
Keine DB-Migration.
Keine Config-Aenderung.
Kein Webserver-Deploy noetig.
```

## Relevante Code-Datei fuer RDAP47

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## Weitere vor RDAP47 zu pruefende Dateien

```text
remote-modboard/backend/public/assets/remote-modboard.js
remote-modboard/backend/public/index.html
```

## RDAP44 relevante UI

```text
Admin -> Admin-Notizen
Zieluser-Auswahl / Dropdown
Name/Login/UID Anzeige
Read/Write/Notizen/Tabelle Metriken
Notizenliste
Create-Form mit Zieluser-Anzeige
```

## Aktuelle relevante Auth-Routen

```text
GET  /api/remote/auth/twitch/start
GET  /api/remote/auth/twitch/callback
GET  /api/remote/auth/login/start
GET  /api/remote/auth/login/plan
POST /api/remote/auth/logout
```

## Aktuelle relevante Admin-Note-Routen

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```
