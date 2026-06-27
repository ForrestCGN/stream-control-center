# Current Chat Handoff - CAN38.2

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

CAN-38.2 vorbereitet: Bus-Diagnose/EventBus-Doku und Read-only-/Write-Regeln ergänzt.

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

Read-only-Schutz im Status:

```text
readOnly = true
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
vipSystemTouched = false
overlayTouched = false
```

Recovery-Preflight-Schutz:

```text
productiveActions = false
canPrepare = false
canExecute = false
routeSafety.method = GET
routeSafety.readOnly = true
routeSafety.commandRoute = false
routeSafety.executeRoute = false
routeSafety.prepareRoute = false
routeSafety.recoveryExecution = false
```

Bisher fehlte:

```text
docs/modules/bus_diagnostics.md
```

## CAN-38.2 Inhalt

Neu:

```text
docs/modules/bus_diagnostics.md
```

Dokumentiert:

```text
Modulzweck
MODULE_META / Version / Routenprefix
interne Status-Endpunkte
read-only Status-Felder
Recovery-Preflight-Sicherheit
Recovery-Readiness
Read-only Routen
produktive/verbotene Aktionen
Dashboard-Tabs und Dashboard-Routen
Read-only Summary Card
bekannter MutationObserver-Stabilitätspunkt
Regeln für spätere Bus-Diagnose-Erweiterungen
```

## Sicherheitsregeln

Erlaubt für Read-only Diagnose:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/check
GET /api/bus-diagnostics/recovery-preflight
GET /api/bus-diagnostics/recovery-simulation/status
GET /api/bus-diagnostics/recovery-simulation/test
GET /api/bus-diagnostics/routes
GET-Status-Endpunkte der angeschlossenen Systeme
```

Nicht automatisch auslösen:

```text
Recovery ausführen
Recovery vorbereiten
OBS-Reparatur
OBS-Source-Refresh
Overlay-Refresh
Queue-Clear
Queue-Retry
Sound-Bus-Play
Sound-Bus-Migration
Alert-Replay
Sound-Replay
Twitch-/Redemption-Write
Chat-/Discord-Nachricht
DB-Migration
Settings speichern
Config schreiben
Admin-POST
```

## Nicht geändert

```text
Keine Codeänderung.
Keine Recovery ausgelöst.
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

## Empfohlener nächster Schritt

```text
CAN-38.2 anwenden.
Danach optional CAN-38.3 Bus-Diagnose Read-only Summary ohne MutationObserver stabilisieren.
```

## Möglicher CAN-38.3 Inhalt

```text
- bestehende Read-only-Karte behalten
- keinen Extra-Tab
- MutationObserver entfernen oder deutlich entschärfen
- Einfügeposition stabil halten
- nur GET /api/bus-diagnostics/status und GET /api/bus-diagnostics/recovery-preflight
- keine produktiven Routen
```

Wichtig:

```text
Keine Recovery.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine Queue-Aktion.
Keine produktive Sound-Bus-Aktion.
Keine DB-Migration.
Keine Chat-/Discord-/Twitch-Nachricht.
Kein Dauer-Rendering.
Keine Funktionalität entfernen.
```
