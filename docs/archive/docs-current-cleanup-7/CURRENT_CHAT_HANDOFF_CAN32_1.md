# Current Chat Handoff - CAN32.1

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

CAN-32.1 vorbereitet: Bus-Diagnose Übersicht bekommt eine read-only Sicherheits-Zusammenfassung.

## Wichtigste Regeln

```text
Keine Funktionalitaet entfernen.
Immer echte aktuelle Dateien/GitHub-dev/Live als Single Source of Truth pruefen.
Erst analysieren/planen, dann auf ausdrueckliches go umsetzen.
Keine produktive Aktion ohne separaten Go-Schritt.
Keine DB ueberschreiben oder neu bauen.
Keine Apply-/Patch-Scripts als Standardlieferung.
```

## Abgeschlossene Schritte

```text
CAN-29.1 Discord clientReady Deprecation Fix umgesetzt und live geprüft.
CAN-30.1 SQLite ExperimentalWarning dokumentiert und akzeptiert.
CAN-31.1 WS Connect Log Summary umgesetzt und live geprüft.
CAN-31.2 Testergebnis dokumentiert.
CAN-32.0 neuen Dashboard/EventBus-Arbeitsblock ausgewählt.
```

## CAN-32.1 Inhalt

Betroffene Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
```

Nicht geändert:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Neue Karte:

```text
Bus-Diagnose > Übersicht > Sicherheits- / Read-only-Zusammenfassung
```

Sie zeigt:

```text
Status read-only
Recovery Route read-only
Flow touched
Queue touched
Sound touched
Overlay touched
Recovery prepare
Recovery execute
```

## Sicherheit

```text
Nur read-only Anzeige.
Nur GET /api/bus-diagnostics/status.
Nur GET /api/bus-diagnostics/recovery-preflight.
Keine Recovery-Ausführung.
Keine OBS-Reparatur.
Keine Sound-/Queue-/Twitch-/DB-Aktion.
Keine produktiven Buttons.
Keine Funktionalität entfernt.
```

## Erwartete Tests

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "CAN-32.1 Bus Diagnose Overview Readonly Summary"
```

Danach Dashboard öffnen:

```text
Bus-Diagnose > Übersicht
```

Prüfen:

```text
Karte sichtbar.
Read-only Werte sichtbar.
Recovery execute bleibt nein.
Keine produktiven Buttons.
```

## Empfohlener nächster Schritt

```text
CAN-32.1 Live-/Dashboard-Sichtprüfung auswerten.
Danach CAN-32.2 Testergebnis dokumentieren.
```
