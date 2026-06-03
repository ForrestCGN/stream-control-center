# CURRENT_STATUS

## Stand: CAN-42.4 vorbereitet

CAN-42.4 bildet die Todo-spezifischen Diagnosewerte zentral in `Admin > Diagnose > Todo` ab.

## Änderung

Geändert:

```text
htdocs/dashboard/modules/diagnostics.js
docs/current/TODO_DIAGNOSTICS_CENTRALIZATION_CAN42_4.md
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN42_4.md
```

Nicht geändert:

```text
backend/modules/todo.js
htdocs/dashboard/modules/todo.js
htdocs/dashboard/modules/todo_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
htdocs/dashboard/index.html
```

## Neue zentrale Todo-Werte

```text
Status OK
Schema OK
Integration OK
Targets
Channels
Fehlende Channels
User-Stats
Daily-Stats
Settings
Textvarianten
Legacy-Texte
DB
```

## Genutzte Routen

```text
GET /api/todo/status
GET /api/todo/integration-check
```

## Wichtig

Der alte Todo-Diagnose-Tab bleibt vorerst eingebunden. Entfernt wird er erst nach positivem Sichttest.

## Nächster Schritt

```text
CAN-42.4 anwenden und Admin > Diagnose > Todo prüfen.
Danach CAN-42.5 Todo-Diagnose-Tab aus Todo-Modul entfernen/deaktivieren.
```
