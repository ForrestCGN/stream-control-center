# Bus-Diagnose / EventBus Read-only Diagnose

## Zweck

Das Modul `backend/modules/bus_diagnostics.js` stellt eine zentrale Diagnose-Aggregation für Kommunikations-Bus/EventBus-nahe Systeme bereit.

Es sammelt Statusdaten aus mehreren internen Status-Endpunkten und bereitet daraus Dashboard-Informationen auf:

```text
Communication-Bus
Sound/EventBus
Sound-Status
Alerts/EventBus
Alerts-Status
Alert/Sound-Korrelation
VIP-Sound-Status
VIP-Sound-Integration
Recovery-Readiness
Recovery-Preflight
Recovery-Simulation
Resilience-Matrix
```

Das Modul ist als **Read-only Diagnose- und Preflight-Modul** zu behandeln.

## Modul-Dateien

```text
backend/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.css
```

## Modul-Metadaten

Aktueller Analyse-Stand CAN-38.1:

```text
MODULE = bus_diagnostics
VERSION = 1.2.9
STATUS_API_VERSION = 1.0.0
build = STEP_CAN9_4
category = diagnostics
routesPrefix = /api/bus-diagnostics
```

`MODULE_META` ist vorhanden:

```text
name: bus_diagnostics
version: 1.2.9
build: STEP_CAN9_4
type: runtime
category: diagnostics
legacy: false
```

Der Bus-Block ist aktuell:

```text
bus.registered = false
bus.heartbeat = false
bus.emits = []
bus.listens = []
```

Das Modul selbst ist also nicht als Bus-Client mit Heartbeat registriert, sondern aggregiert Statusdaten anderer Systeme.

## Wichtige Erkenntnis CAN-38.1

Die erwartete Datei:

```text
backend/core/event_bus.js
```

wurde in GitHub/dev nicht gefunden.

Die tatsächlich vorhandene Bus-Diagnose befindet sich in:

```text
backend/modules/bus_diagnostics.js
```

## Backend-Endpunkte

Registrierte Bus-Diagnose-Routen:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/check
GET /api/bus-diagnostics/recovery-preflight
GET /api/bus-diagnostics/recovery-simulation/status
GET /api/bus-diagnostics/recovery-simulation/test
GET /api/bus-diagnostics/routes
```

Diese Routen sind als Diagnose/Read-only/Synthese-Simulation zu behandeln.

## Intern gelesene Status-Endpunkte

`/api/bus-diagnostics/status` bzw. `buildStatus()` liest intern:

```text
GET /api/communication/status
GET /api/sound/eventbus/status
GET /api/sound/status
GET /api/alerts/eventbus/status
GET /api/alerts/status
GET /api/alerts/eventbus/correlation/status
GET /api/vip-sound/status
GET /api/vip-sound/integration-check
```

Diese Endpunkte werden per HTTP abgefragt und danach zu einem Diagnoseobjekt zusammengeführt.

## Read-only Status-Felder

Der Status setzt explizit:

```text
readOnly = true
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
vipSystemTouched = false
overlayTouched = false
```

Das ist für Dashboard-Anzeigen und Sicherheitskarten wichtig.

## Recovery-Preflight

Die Route:

```text
GET /api/bus-diagnostics/recovery-preflight
```

setzt unter anderem:

```text
readOnly = true
productiveActions = false
canPrepare = false
canExecute = false
automationEnabled = false
flowTouched = false
queueTouched = false
soundSystemTouched = false
alertSystemTouched = false
vipSystemTouched = false
overlayTouched = false
```

und `routeSafety`:

```text
method = GET
readOnly = true
commandRoute = false
executeRoute = false
prepareRoute = false
recoveryExecution = false
dashboardActionButtonRequired = false
```

Wichtige Regel:

```text
Recovery-Preflight zeigt Bereitschaft und Sperren an, führt aber keine Recovery aus.
```

## Recovery-Readiness

Recovery-Readiness prüft unter anderem:

```text
diagnostics_routes_available
recovery_strategy_read_only
automation_disabled
resilience_matrix_no_errors
productive_actions_disabled
```

Harte Sperren sind vorgesehen für:

```text
auto_replay_alert
manual_replay_alert
auto_replay_sound
manual_replay_sound
auto_retry_overlay
auto_recovery
manual_recovery_execution
```

Diese Sperren dürfen nicht durch Dashboard-Erweiterungen umgangen werden.

## Read-only Routen für Diagnose/Dashboard

Diese Routen dürfen für Diagnose-Anzeigen genutzt werden:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/check
GET /api/bus-diagnostics/recovery-preflight
GET /api/bus-diagnostics/recovery-simulation/status
GET /api/bus-diagnostics/recovery-simulation/test
GET /api/bus-diagnostics/routes
GET /api/communication/status
GET /api/sound/eventbus/status
GET /api/sound/status
GET /api/alerts/eventbus/status
GET /api/alerts/status
GET /api/alerts/eventbus/correlation/status
GET /api/vip-sound/status
GET /api/vip-sound/integration-check
GET /api/bus-integration-matrix/status
GET /api/overlay-monitor/client-control/status
GET /api/communication/settings
```

Hinweis zu `GET /api/communication/settings`:

```text
Nur Lesen. Keine Settings speichern.
```

## Produktive / verbotene Aktionen ohne separaten Go-Schritt

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

## Dashboard

Dashboard-Datei:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Tabs:

```text
Übersicht
Clients
Events & ACKs
Integrationen
Bus-Matrix
Recovery
Issues
Config
Rohdaten
```

Dashboard-Aktionen/Schaltflächen:

```text
Status laden
Check ausführen
Auto: an/aus
Standalone
```

Wichtig:

```text
Status laden und Check ausführen müssen reine GET-/Read-only-Abfragen bleiben.
Auto-Refresh darf nur Read-only GET-Routen nutzen.
```

## Dashboard: zusätzlich gelesene Endpunkte

Das Dashboard liest zusätzlich:

```text
GET /api/communication/settings
GET /api/bus-diagnostics/recovery-preflight
GET /api/bus-integration-matrix/status
GET /api/overlay-monitor/client-control/status
```

Diese gelten für die Anzeige als read-only, solange keine zugehörigen Schreib-/Action-Routen aufgerufen werden.

## Read-only Summary Card

Zusätzliche Dashboard-Datei:

```text
htdocs/dashboard/modules/bus_diagnostics_readonly_summary.js
```

Version:

```text
0.1.0-can32-1
```

Sie zeigt in der Übersicht eine Sicherheits-/Read-only-Zusammenfassung und ruft nur:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

## Bekannter Stabilitätspunkt

`bus_diagnostics_readonly_summary.js` nutzt aktuell einen `MutationObserver`.

Bisher ist das nicht als akuter Fehler bestätigt, aber nach früheren Erfahrungen mit Firefox-/Tab-Hängern ist das ein sinnvoller Kandidat für einen späteren kleinen Stabilitäts-Cleanup.

Empfohlener Folge-Step:

```text
CAN-38.3 - Bus-Diagnose Read-only Summary ohne MutationObserver stabilisieren
```

Ziel:

```text
- bestehende Read-only-Karte behalten
- keinen Extra-Tab
- MutationObserver entfernen oder deutlich entschärfen
- Einfügeposition stabil halten
- keine produktiven Routen
```

## Sicherheitsregel für zukünftige Bus-Diagnose-Erweiterungen

Für spätere Dashboard-Diagnosekarten gilt:

```text
Read-only Diagnose:
- darf /api/bus-diagnostics/status lesen
- darf /api/bus-diagnostics/check lesen
- darf /api/bus-diagnostics/recovery-preflight lesen
- darf /api/bus-diagnostics/recovery-simulation/status lesen
- darf /api/bus-diagnostics/recovery-simulation/test lesen
- darf /api/bus-diagnostics/routes lesen
- darf Status-Endpunkte der angeschlossenen Systeme lesen
- darf keine Recovery vorbereiten
- darf keine Recovery ausführen
- darf keine OBS-Reparatur auslösen
- darf keinen Source-Refresh auslösen
- darf keine Queue-Aktion auslösen
- darf keinen Sound-Bus-Play auslösen
- darf keine Alert-/Sound-Replays auslösen
- darf keine Settings speichern
- darf keine Config schreiben
- darf keine DB-Migration auslösen
- darf keine Twitch-/Chat-/Discord-Nachricht posten
- darf keine automatischen Heilungs-/Recovery-Loops starten
```

## Stand

```text
CAN-38.2: Doku-/Regelstand erstellt.
```
