# CURRENT_STATUS

## Stand: CAN-38.3 vorbereitet

CAN-38.3 stabilisiert die bestehende Bus-Diagnose Read-only Summary Card ohne MutationObserver.

## Aktueller Arbeitsbereich

```text
CAN-38: EventBus / Bus-Diagnose Read-only Diagnose prüfen und glätten
```

## Änderung CAN-38.3

Geändert:

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

## Ziel

```text
Bestehende Read-only-Karte behalten.
Keinen Extra-Tab.
MutationObserver entfernen.
Einfügeposition auf Übersicht stabil halten.
Keine produktiven Routen.
Kein Dauer-Rendering.
```

## Genutzte Routen

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

## Nicht genutzt

```text
Keine Recovery.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine Queue-Aktion.
Keine produktive Sound-Bus-Aktion.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Twitch-/Chat-/Discord-Nachricht.
Keine Funktionalität entfernt.
```

## Technische Änderung

```text
MutationObserver entfernt.
Stattdessen kontrollierte Event-Hooks:
- DOMContentLoaded
- Klicks auf Bus-Diagnose-Tabs
- Klicks auf Bus-Diagnose-Aktionen
- optionale cgn:module-show Events
- hashchange
- visibilitychange
```

Die Karte ruft weiterhin nur Read-only-Diagnoserouten ab.

## Nächster Schritt

```text
CAN-38.3 anwenden und Dashboard-Sichtprüfung machen.
Danach CAN-38.4 Testergebnis dokumentieren.
```
