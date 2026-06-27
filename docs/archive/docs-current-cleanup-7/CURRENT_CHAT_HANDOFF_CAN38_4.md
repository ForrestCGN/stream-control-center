# Current Chat Handoff - CAN38.4

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

CAN-38.4 abgeschlossen: Bus-Diagnose/EventBus wurde dokumentiert, die Read-only Summary Card wurde ohne MutationObserver stabilisiert und der Sichttest wurde bestätigt.

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
CAN-36.4 Message-Rotator-Modul dokumentiert und vorhandener Diagnose-Tab erweitert; Positionstest erfolgreich.
CAN-37.4 Hug-System dokumentiert und vorhandener Diagnose-Tab erweitert; Sichttest erfolgreich.
CAN-38.0 neuen Arbeitsblock ausgewählt.
CAN-38.1 EventBus / Bus-Diagnose read-only analysiert.
CAN-38.2 Bus-Diagnose/EventBus-Doku und Read-only-/Write-Regeln ergänzt.
CAN-38.3 Bus-Diagnose Read-only Summary ohne MutationObserver stabilisiert.
CAN-38.4 Testergebnis dokumentiert.
```

## CAN-38.1 Analyse-Kurzfassung

Nicht gefunden:

```text
backend/core/event_bus.js
```

Aktives Bus-Diagnose-Modul:

```text
backend/modules/bus_diagnostics.js
```

Modul-Metadaten:

```text
MODULE = bus_diagnostics
VERSION = 1.2.9
STATUS_API_VERSION = 1.0.0
build = STEP_CAN9_4
routesPrefix = /api/bus-diagnostics
```

Backend-Routen:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/check
GET /api/bus-diagnostics/recovery-preflight
GET /api/bus-diagnostics/recovery-simulation/status
GET /api/bus-diagnostics/recovery-simulation/test
GET /api/bus-diagnostics/routes
```

## CAN-38.2

Neu:

```text
docs/modules/bus_diagnostics.md
```

Dort sind Read-only-/Write-Regeln, Recovery-Sperren und Dashboard-Regeln dokumentiert.

## CAN-38.3

Geändert:

```text
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
```

Technische Änderung:

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

Genutzte Routen:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Nicht genutzt:

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

## CAN-38.4 bestätigtes Sicht-Ergebnis

```text
Dashboard > Bus-Diagnose > Übersicht
Die Sicherheits- / Read-only-Zusammenfassung wird oben in der Übersicht angezeigt.
Kein zusätzlicher Tab.
Tabs bleiben: Übersicht | Clients | Events & ACKs | Integrationen | Bus-Matrix | Recovery | Issues | Config | Rohdaten.
Status read-only: ja.
Recovery Route read-only: ja.
Flow touched: nein.
Queue touched: nein.
Sound touched: nein.
Overlay touched: nein.
Recovery prepare: nein.
Recovery execute: nein.
Gesamtstatus und weitere Bus-Karten bleiben sichtbar.
Dashboard bleibt bedienbar.
Keine Recovery-/OBS-/Sound-/Queue-/DB-/Chat-Aktion erkennbar.
```

## Ergebnis

```text
CAN-38.3 Ziel erfüllt.
Read-only Summary Card bleibt erhalten.
MutationObserver wurde entfernt.
Die Karte wird korrekt in der Übersicht angezeigt.
Kein Extra-Tab.
Keine produktive Aktion ausgelöst.
Keine Funktionalität entfernt.
```

## Empfohlener Start im neuen Chat

```text
Wir machen mit dem stream-control-center weiter. Bitte lies zuerst docs/current/CURRENT_CHAT_HANDOFF_CAN38_4.md und halte dich an den Master-Prompt. Aktueller Stand ist CAN-38.4 abgeschlossen. Nächster Schritt: CAN-39.0 neuen Arbeitsblock bewusst auswählen.
```

## Mögliche nächste Kandidaten

```text
1. Overlay-Monitor Dashboard-Details optisch weiter vereinfachen.
2. Bus-Diagnose Unterseiten weiter glätten, z. B. Recovery/Issues/Raw klarer strukturieren.
3. Nächstes Community-/Runtime-Modul an Status-/Doku-Regeln anpassen.
4. EventBus-/Modul-Heartbeat-Konzept weiter planen.
5. Langfristigen DB-Core-Treiberwechsel separat planen, aber nicht direkt umsetzen.
```
