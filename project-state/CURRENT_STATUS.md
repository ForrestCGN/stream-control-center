# CURRENT_STATUS

## Stand: CAN-40.2 vorbereitet

CAN-40.2 ergänzt Bus-Diagnose-Unterseiten um Sicherheits-/Read-only-Hinweise.

## Aktueller Arbeitsbereich

```text
CAN-40: Bus-Diagnose Unterseiten read-only glätten
```

## Änderung CAN-40.2

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN40_2.md
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
Bestehende Tabs behalten.
Kein Extra-Tab.
Recovery-Unterseite klarer als read-only/preflight markieren.
Sound-Bus Dry-Run klarer als manuelle Diagnose-Aktion markieren.
Raw/Config/Issues optisch als Diagnose/Anzeige markieren.
Keine POSTs automatisch auslösen.
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
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Twitch-/Chat-/Discord-Nachricht.
Keine Funktionalität entfernt.
```

## Technische Umsetzung

```text
Zusätzliche Dashboard-Erweiterung nach bus_diagnostics.js und bus_diagnostics_readonly_summary.js.
Kein MutationObserver.
Begrenzter Retry nach Navigation/Render.
Keine API-Calls.
Keine API-POSTs.
Nur DOM-Hinweise und Klassenmarkierung.
```

## Nächster Schritt

```text
CAN-40.2 anwenden und Bus-Diagnose-Unterseiten prüfen.
Danach CAN-40.3 Testergebnis dokumentieren.
```
