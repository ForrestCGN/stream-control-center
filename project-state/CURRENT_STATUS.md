# CURRENT_STATUS

## Stand: CAN-40.2b vorbereitet

CAN-40.2b reduziert die Bus-Diagnose-Sicherheits-Hinweise.

## Änderung CAN-40.2b

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN40_2b.md
```

Nicht geändert:

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
```

## Ziel

```text
Großen Safety-Hinweis nur auf Übersicht behalten.
Auf Recovery nur kleinen Hinweis lassen.
Auf Bus-Matrix nur Sound-Bus Dry-Run als manuell markieren.
Auf Issues / Config / Rohdaten keinen großen Hinweis mehr anzeigen.
Keine produktive Aktion.
```

## Nicht ausgelöst

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

## Nächster Schritt

```text
CAN-40.2b anwenden und Sichtprüfung machen.
Danach CAN-40.3 Testergebnis dokumentieren.
```
