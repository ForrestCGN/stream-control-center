# FILES

## Aktueller Arbeitsstand CAN-40.3

Wichtige geaenderte/zuletzt relevante Dateien:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN40_3.md
```

## CAN-40 ZIPs aus dem Chat

```text
CAN-40.2_bus_diagnostics_subpage_safety_hints.zip
CAN-40.2b_bus_diagnostics_reduce_safety_hints.zip
CAN-40.3_document_bus_diagnostics_reduced_hints_test.zip
```

## CAN-40 relevante Runtime-/Dashboard-Dateien

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.css
htdocs/dashboard/index.html
docs/modules/bus_diagnostics.md
```

CAN-40.3 selbst ändert keine Runtime-/Dashboard-Datei.

## Bestätigter CAN-40.2b Sichttest

```text
Dashboard > Bus-Diagnose
Übersicht: großer Read-only/Safety-Hinweis sichtbar.
Recovery: nur kleiner Hinweis sichtbar.
Bus-Matrix: Sound-Bus Dry-Run als manuell markiert.
Issues: kein großer Hinweis.
Config: kein großer Hinweis.
Rohdaten: kein großer Hinweis.
Keine Recovery.
Kein Sound-Dry-Run.
Keine OBS-/Sound-/Queue-/DB-/Chat-Aktion.
```

## Sicherheitsnotiz

```text
Keine Recovery.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine Queue-Aktion.
Kein Sound-Bus Dry-Run.
Keine produktive Sound-Bus-Aktion.
Keine DB-Migration.
Keine API-POSTs.
Keine Twitch-/Chat-/Discord-Nachricht.
Keine Funktionalität entfernt.
```
