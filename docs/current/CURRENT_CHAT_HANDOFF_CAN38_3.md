# Current Chat Handoff - CAN38.3

## Projekt

ForrestCGN `stream-control-center`

```text
Repo: https://github.com/ForrestCGN/stream-control-center
Branch: dev
Lokales Repo: D:\Git\stream-control-center
Live-Ziel: D:\Streaming\stramAssets
Produktive SQLite-DB: D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

## Aktueller Stand

CAN-38.3 vorbereitet: Bus-Diagnose Read-only Summary Card wurde ohne MutationObserver stabilisiert.

## Geändert

```text
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
```

Zusätzlich Dokumentation/Status:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_CAN38_3.md
```

## Nicht geändert

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
```

## Technische Änderung

```text
MutationObserver entfernt.
Keine dauerhafte DOM-Beobachtung mehr.
Kontrollierte Event-Hooks:
- DOMContentLoaded
- Klicks auf Bus-Diagnose-Tabs
- Klicks auf Bus-Diagnose-Aktionen
- cgn:module-show
- hashchange
- visibilitychange
```

## Genutzte Routen

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

## Nicht genutzt

```text
Recovery
OBS-Reparatur
Source-Refresh
automatische Recovery
Queue-Aktion
produktive Sound-Bus-Aktion
DB-Migration
Dashboard-Testbuttons für produktive Aktionen
Twitch-/Chat-/Discord-Nachricht
```

## Test

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-38.3 Bus Diagnose Readonly Summary ohne MutationObserver"
```

Danach prüfen:

```text
Dashboard > Bus-Diagnose > Übersicht
```

Erwartung:

```text
Sicherheits- / Read-only-Zusammenfassung wird angezeigt.
Kein zusätzlicher Tab.
Dashboard bleibt bedienbar.
Kein Firefox-Hänger.
Keine Recovery-/OBS-/Sound-/Queue-/DB-/Chat-Aktion.
```

## Nächster Schritt

```text
CAN-38.4 Testergebnis dokumentieren.
```
