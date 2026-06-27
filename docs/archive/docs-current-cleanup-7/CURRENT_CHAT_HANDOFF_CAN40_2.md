# Current Chat Handoff - CAN40.2

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

CAN-40.2 vorbereitet: Bus-Diagnose-Unterseiten wurden um Sicherheits-/Read-only-Hinweise ergänzt.

## Geändert

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.js
htdocs/dashboard/modules/bus_diagnostics_subpage_safety_ext.css
project-state/*
docs/current/CURRENT_CHAT_HANDOFF_CAN40_2.md
```

## Nicht geändert

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
```

## Ziel

```text
Recovery-Unterseite klarer als read-only/preflight markieren.
Sound-Bus Dry-Run klarer als manuelle Diagnose-Aktion markieren.
Raw/Config/Issues optisch als Diagnose/Anzeige markieren.
Kein Extra-Tab.
Keine produktiven Aktionen.
```

## Technisch

```text
Kein MutationObserver.
Begrenzter Retry nach Navigation/Render.
Keine API-Calls.
Keine API-POSTs.
Nur DOM-Hinweise und Klassenmarkierung.
```

## Test

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-40.2 Bus Diagnose Unterseiten Safety Hinweise"
```

Danach prüfen:

```text
Dashboard > Bus-Diagnose
```

Erwartung:

```text
Übersicht: Read-only Hinweis sichtbar.
Recovery: Safety-Hinweis sichtbar, keine Recovery ausgelöst.
Bus-Matrix: Sound-Bus Dry-Run als manuell markiert.
Issues: Anzeige-/Diagnosehinweis sichtbar.
Config: Anzeige-/Settings-Lesehinweis sichtbar.
Rohdaten: Nur-Anzeige-Hinweis sichtbar.
Keine OBS-/Sound-/Queue-/DB-/Chat-Aktion.
```

## Nächster Schritt

```text
CAN-40.3 Testergebnis dokumentieren.
```
