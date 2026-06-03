# FILES

## Aktueller Arbeitsstand CAN-38.3

Geänderte Dateien:

```text
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN38_3.md
```

Nicht geändert:

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
```

## CAN-38 ZIPs aus dem Chat

```text
CAN-38.2_bus_diagnostics_docs_readonly_write_rules.zip
CAN-38.3_bus_diagnostics_readonly_summary_no_mutationobserver.zip
```

## Sicherheitsnotiz

```text
CAN-38.3 ruft nur GET /api/bus-diagnostics/status und GET /api/bus-diagnostics/recovery-preflight.
Keine Recovery.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine Queue-Aktion.
Keine produktive Sound-Bus-Aktion.
Keine DB-Migration.
Keine Twitch-/Chat-/Discord-Nachricht.
Keine Funktionalität entfernt.
```
