# Current Chat Handoff - CAN39.2

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

CAN-39.2 vorbereitet: Overlay-Monitor-Doku und Read-only-/Write-Regeln ergänzt.

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
CAN-37.4 Hug-System dokumentiert und vorhandener Diagnose-Tab erweitert; Sichttest erfolgreich.
CAN-38.4 Bus-Diagnose/EventBus dokumentiert und Read-only Summary ohne MutationObserver sichtbar geprüft.
CAN-39.0 neuen Arbeitsblock ausgewählt.
CAN-39.1 Overlay-Monitor / Overlay-Dashboard read-only analysiert.
```

## CAN-39.1 Analyse-Kurzfassung

Aktives Backend:

```text
backend/modules/overlay_monitor.js
```

Modul-Metadaten:

```text
MODULE = overlay_monitor
VERSION = 0.1.8
STATUS_API_VERSION = 1.0.8
build = CAN-26.2
routesPrefix = /api/overlay-monitor
```

Bus:

```text
bus.registered = true
bus.heartbeat = true
emits = overlay_monitor.status, overlay_monitor.issue
listens = communication.clients
```

Dashboard:

```text
htdocs/dashboard/modules/overlays.js
```

Wichtige Dashboard-Routen:

```text
GET /api/overlay-monitor/status?events=10
GET /api/obs/status
GET /api/obs/browser-sources
GET /api/obs/scenes
GET /api/overlay-monitor/issues?status=all&limit=150
GET /api/overlay-monitor/obs-inventory
POST /api/overlay-monitor/obs-source/action
```

Produktive Route:

```text
POST /api/overlay-monitor/obs-source/action
```

Diese kann Browserquellen refreshen, Cache refreshen, Quellen show/hide/toggle/cycle/restart ausführen und danach das OBS-Inventar aktualisieren.

Bisher fehlte:

```text
docs/modules/overlay_monitor.md
```

## CAN-39.2 Inhalt

Neu:

```text
docs/modules/overlay_monitor.md
```

Dokumentiert:

```text
Modulzweck
MODULE_META / Version / Routenprefix
Bus-Registrierung und Heartbeat
Konfiguration
Monitoring-Issues und Inventory-Cache
Hintergrund-Monitoring
read-only Statusrouten
Overlay Client Control Status
OBS-Inventar-Route
produktive/manuelle OBS-Reparaturroute
Dashboard-Routen
Dashboard-Auto-Refresh
produktive Dashboard-Aktionen
Regeln für spätere Overlay-Monitor-Erweiterungen
```

## Sicherheitsregeln

Read-only Diagnose darf lesen:

```text
GET /api/overlay-monitor/status
GET /api/overlay-monitor/client-control/status
GET /api/overlay-monitor/client-control/classification
GET /api/overlay-monitor/client-control/identity-contract
GET /api/overlay-monitor/issues
GET /api/overlay-monitor/events
GET /api/overlay-monitor/routes
GET /api/obs/status
GET /api/obs/browser-sources
GET /api/obs/scenes
```

Vorsichtig / nicht automatisch:

```text
GET /api/overlay-monitor/obs-inventory?refresh=1
GET /api/obs/scene-items?scene=...
```

Nicht automatisch auslösen:

```text
POST /api/overlay-monitor/obs-source/action
```

## Nicht geändert

```text
Keine Codeänderung.
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine Overlay-Refresh-Aktion.
Keine Queue-Aktion.
Keine produktive Sound-/Alert-Aktion.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Twitch-/Chat-/Discord-Nachricht.
Keine Funktionalität entfernt.
```

## Empfohlener nächster Schritt

```text
CAN-39.2 anwenden.
Danach optional CAN-39.3 Overlay-Monitor Übersicht optisch vereinfachen / produktive Aktionen klarer markieren.
```

## Möglicher CAN-39.3 Inhalt

```text
- keine Backend-Änderung
- keine Reparaturaktion auslösen
- sichtbare Trennung: Read-only Diagnose vs. manuelle OBS-Aktionen
- Hinweis bei OBS-Inventar-Refresh: liest OBS und aktualisiert Cache
- produktive Reparaturbuttons optisch klar als manuell markieren
```

Wichtig:

```text
Keine OBS-Reparatur.
Kein Source-Refresh.
Keine automatische Recovery.
Keine Overlay-Refresh-Aktion.
Keine Queue-Aktion.
Keine produktive Sound-/Alert-Aktion.
Keine DB-Migration.
Keine Dashboard-Testbuttons für produktive Aktionen.
Keine Twitch-/Chat-/Discord-Nachricht.
Keine Funktionalität entfernen.
```
