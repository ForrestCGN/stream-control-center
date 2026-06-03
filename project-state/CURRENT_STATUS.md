# CURRENT_STATUS

## Stand: CAN-42.5 vorbereitet

CAN-42.5 deaktiviert den alten Todo-Diagnose-Tab in der Todo-Modulseite.

## Änderung

Geändert:

```text
htdocs/dashboard/index.html
docs/current/TODO_DIAGNOSTICS_TAB_DISABLED_CAN42_5.md
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN42_5.md
```

Nicht geändert:

```text
backend/modules/todo.js
htdocs/dashboard/modules/todo.js
htdocs/dashboard/modules/todo_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
```

## Ergebnis

```text
Todo-Diagnose-Extension wird nicht mehr geladen.
Todo-Diagnose-Tab verschwindet aus der Todo-Modulseite.
Todo-Bedienbereiche bleiben erhalten.
Admin > Diagnose > Todo bleibt zentrale Diagnose.
```

## Nächster Schritt

```text
CAN-42.5 anwenden und Sichttest machen.
Danach CAN-42.6 Tagebuch-Diagnosewerte zentral abbilden.
```
