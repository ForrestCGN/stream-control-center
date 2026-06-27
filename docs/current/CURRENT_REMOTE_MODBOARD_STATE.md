# CURRENT_REMOTE_MODBOARD_STATE

Stand: RDAP113C_ADMIN_USERS_BACK_TO_ADMIN_NAV  
Datum: 2026-06-27

## UI-/Produktregel

```text
Das Modboard ist ein Werkzeug fuer Streambetrieb, Mods und Admins.
Keine Projekt-Erklaerungen in normalen Ansichten.
Keine technische Dauerwand.
Mods/Streamer sehen: OK, Problem, Handlungshinweis.
Technische Details nur hinter Info oder in Admin-Bereichen.
```

## Strukturstand

```text
Shell:
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js

Ausgelagerte/strukturierte Frontend-Module:
remote-modboard/backend/public/assets/modules/system/overview.js
remote-modboard/backend/public/assets/modules/system/diagnostics.js
remote-modboard/backend/public/assets/modules/admin/users.js
```

## Navigation

```text
Admin:
- Benutzerverwaltung
- Rollen & Rechte
- Sicherheit

Mein Konto oben rechts:
- Meine Rechte
- Profil aktualisieren
- Ausloggen
```

## Sicherheit

```text
Keine Agent-Runtime aktiv.
Keine Agent-Actions aktiv.
Keine Backend-Aenderung in RDAP113C.
Keine DB-Migration in RDAP113C.
Admin-Benutzerverwaltung bleibt read-only.
```
