# CURRENT_STATUS

## Stand: CAN-38.2 vorbereitet

CAN-38.2 ergänzt eine dedizierte Bus-Diagnose/EventBus-Read-only-Doku mit Read-only-/Write-Regeln.

## Aktueller Arbeitsbereich

```text
CAN-38: EventBus / Bus-Diagnose Read-only Diagnose prüfen und glätten
```

## Ergebnis CAN-38.1 Analyse

Nicht gefunden:

```text
backend/core/event_bus.js
```

Aktives Bus-Diagnose-Modul:

```text
backend/modules/bus_diagnostics.js
```

Modulstand:

```text
MODULE = bus_diagnostics
VERSION = 1.2.9
STATUS_API_VERSION = 1.0.0
build = STEP_CAN9_4
routesPrefix = /api/bus-diagnostics
```

Vorhanden:

```text
MODULE_META
/api/bus-diagnostics/status
/api/bus-diagnostics/check
/api/bus-diagnostics/recovery-preflight
/api/bus-diagnostics/recovery-simulation/status
/api/bus-diagnostics/recovery-simulation/test
/api/bus-diagnostics/routes
Dashboard bus_diagnostics.js
Dashboard bus_diagnostics_readonly_summary.js
```

Nicht vorhanden war bisher:

```text
docs/modules/bus_diagnostics.md
```

## Änderung CAN-38.2

Neu:

```text
docs/modules/bus_diagnostics.md
```

Darin festgehalten:

```text
- Modulzweck
- MODULE_META / Version / Routenprefix
- interne Status-Endpunkte
- read-only Status-Felder
- Recovery-Preflight-Sicherheit
- Recovery-Readiness
- Read-only Routen
- produktive/verbotene Aktionen
- Dashboard-Tabs und Dashboard-Routen
- Read-only Summary Card
- bekannter MutationObserver-Stabilitätspunkt
- Regeln für spätere Bus-Diagnose-Erweiterungen
```

## Wichtigste Sicherheitsentscheidung

Bus-Diagnose ist als Anzeige-/Diagnose-System zu behandeln.

Erlaubt:

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

## Nächster Schritt

```text
CAN-38.2 anwenden.
Danach optional CAN-38.3 Bus-Diagnose Read-only Summary ohne MutationObserver stabilisieren.
```
