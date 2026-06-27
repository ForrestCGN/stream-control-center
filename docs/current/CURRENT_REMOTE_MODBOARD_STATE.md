# CURRENT_REMOTE_MODBOARD_STATE

Stand: RDAP112_SYSTEM_ROUTES_MODULE_DECISION  
Datum: 2026-06-27

## UI-/Produktregel

```text
Das Modboard ist ein Werkzeug fuer Streambetrieb, Mods und Admins.
Keine Projekt-Erklaerungen in normalen Ansichten.
Keine technische Dauerwand.
Mods/Streamer sehen: OK, Problem, Handlungshinweis.
Technische Details nur hinter Info oder in Details/Admin-Bereichen.
```

## Strukturstand

```text
Shell:
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.js

Ausgelagerte Module / System-Frontend:
remote-modboard/backend/public/assets/modules/system/overview.js
remote-modboard/backend/public/assets/modules/system/diagnostics.js
```

## RDAP112 Entscheidung

```text
Routen bleiben nicht als normaler System-Menuepunkt sichtbar.
Routen werden in der UI als Details / System-Routen behandelt.
Die Ansicht ist stark vereinfacht und nur fuer Admin-/Fehlerdiagnose gedacht.
Keine Backend-Aenderung.
Keine neue Route.
Keine DB-Migration.
Keine Agent-/Runtime-Aktivierung.
```

## Sicherheit

```text
Keine Agent-Runtime aktiv.
Keine Agent-Actions aktiv.
Keine Backend-Aenderung in RDAP109-RDAP112.
Keine DB-Migration in RDAP109-RDAP112.
```
