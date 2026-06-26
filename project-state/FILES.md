# FILES

Stand: RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Geaendert in RDAP44B

```text
docs/current/RDAP44B_ADMIN_NOTE_TARGET_USER_SELECTION_LIVE_CONFIRMED_DOCS.md
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP44B.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Keine Code-Dateien in RDAP44B

```text
RDAP44B ist Doku-/Live-Bestaetigung-only.
Kein Backend-Code.
Kein Frontend-Code.
Keine DB-Migration.
Keine Config-Aenderung.
Kein Webserver-Deploy noetig.
```

## Code-Datei aus RDAP44

```text
remote-modboard/backend/public/assets/rdap28-admin-notes.js
```

## RDAP44 Live-relevante UI

```text
Admin -> Admin-Notizen
Zieluser-Auswahl / Dropdown
Name/Login/UID Anzeige
Read/Write/Notizen/Tabelle Metriken
Notizenliste
Create-Form mit Zieluser-Anzeige
```

## Aktuelle relevante Admin-Note-Routen

```text
GET  /api/remote/admin/users/admin-notes/read
POST /api/remote/admin/users/admin-notes/create
POST /api/remote/admin/users/admin-notes/update      -> disabled
POST /api/remote/admin/users/admin-notes/deactivate  -> disabled
```

## Naechster Dateibereich fuer RDAP45

Vor RDAP45 echte Dateien pruefen/suchen:

```text
remote-modboard/backend/src/app.js
remote-modboard/backend/src/routes/routes.routes.js
remote-modboard/backend/src/routes/*auth*.js
remote-modboard/backend/src/services/*auth*.service.js
tools/remote-modboard-deploy.sh
```

Falls die exakten Auth-Dateien anders heissen, per GitHub/dev suchen und nicht raten.
