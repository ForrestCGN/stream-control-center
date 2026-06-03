# Current Chat Handoff - CAN40.2b

## Stand

CAN-40.2b vorbereitet: Bus-Diagnose-Hinweise reduziert.

## Geändert

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN40_2b.md
```

## Nicht geändert

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
```

## Ergebnis/Ziel

```text
Großer Safety-Hinweis nur auf Übersicht.
Recovery nur kleiner Hinweis.
Bus-Matrix nur Dry-Run manuell markieren.
Issues/Config/Rohdaten ohne großen Hinweis.
Keine produktive Aktion.
```

## Test

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-40.2b Bus Diagnose Hinweise reduzieren"
```

Danach prüfen:

```text
Dashboard > Bus-Diagnose
```
