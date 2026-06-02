# FILES

## Aktueller Arbeitsstand CAN-34.3

Wichtige geaenderte/zuletzt relevante Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/todo_readonly_diagnostics.js
htdocs/dashboard/modules/todo_readonly_diagnostics.css
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN34_3.md
```

## CAN-34 ZIPs aus dem Chat

```text
CAN-34.2_todo_module_docs_readonly_write_rules.zip
CAN-34.3_todo_dashboard_readonly_diagnostics.zip
```

## Wichtige Sicherheitsnotiz

```text
htdocs/dashboard/modules/todo.js bleibt unverändert.
backend/modules/todo.js bleibt unverändert.
Die neue Karte nutzt nur read-only GET-Routen.
```

## Prüfung

```text
Dashboard > Todo > Übersicht
Todo Read-only Diagnose sichtbar.
Produktive Routen als gesperrt markiert.
Keine Add-/Reload-/Admin-POST-Buttons.
```

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Todo Backend: D:\Streaming\stramAssets\backend\modules\todo.js
Todo Dashboard: D:\Streaming\stramAssets\htdocs\dashboard\modules\todo.js
```
