# FILES

## Aktueller Arbeitsstand CAN-33.3

Wichtige geaenderte/zuletzt relevante Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/commands_readonly_diagnostics.js
htdocs/dashboard/modules/commands_readonly_diagnostics.css
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN33_3.md
```

## CAN-33 ZIPs aus dem Chat

```text
CAN-33.2_commands_module_docs_readonly_rules.zip
CAN-33.3_commands_dashboard_readonly_diagnostics.zip
```

## Wichtige Sicherheitsnotiz

```text
htdocs/dashboard/modules/commands.js bleibt unverändert.
backend/modules/commands.js bleibt unverändert.
Die neue Karte nutzt nur read-only GET-Routen.
```

## Prüfung

```text
Dashboard > Commands > Diagnose
Commands Read-only Diagnose sichtbar.
Produktive Routen als gesperrt markiert.
Keine Execute-/Upsert-/Delete-Buttons.
```

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Commands Backend: D:\Streaming\stramAssets\backend\modules\commands.js
Commands Dashboard: D:\Streaming\stramAssets\htdocs\dashboard\modules\commands.js
```
