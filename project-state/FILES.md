# FILES

## Aktueller Arbeitsstand CAN-38.4

Wichtige geaenderte/zuletzt relevante Dateien:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN38_4.md
```

## CAN-38 ZIPs aus dem Chat

```text
CAN-38.2_bus_diagnostics_docs_readonly_write_rules.zip
CAN-38.3_bus_diagnostics_readonly_summary_no_mutationobserver.zip
CAN-38.4_document_bus_diagnostics_readonly_summary_test.zip
```

## CAN-38 relevante Runtime-/Dashboard-Dateien

```text
docs/modules/bus_diagnostics.md
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
```

CAN-38.4 selbst ändert keine Runtime-/Dashboard-Datei.

## Bestätigter CAN-38.3 Sichttest

```text
Dashboard > Bus-Diagnose > Übersicht
Sicherheits- / Read-only-Zusammenfassung wird angezeigt.
Kein zusätzlicher Tab.
Status read-only: ja.
Recovery Route read-only: ja.
Flow touched: nein.
Queue touched: nein.
Sound touched: nein.
Overlay touched: nein.
Recovery prepare: nein.
Recovery execute: nein.
Gesamtstatus und weitere Bus-Karten bleiben sichtbar.
Keine Recovery-/OBS-/Sound-/Queue-/DB-/Chat-Aktion.
```

## Sicherheitsnotiz

```text
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

## Lokale Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
Bus-Diagnose Backend: D:\Streaming\stramAssets\backend\modules\bus_diagnostics.js
Bus-Diagnose Dashboard: D:\Streaming\stramAssets\htdocs\dashboard\modules\bus_diagnostics.js
Read-only Summary: D:\Streaming\stramAssets\htdocs\dashboard\modules\bus_diagnostics_readonly_summary.js
```
