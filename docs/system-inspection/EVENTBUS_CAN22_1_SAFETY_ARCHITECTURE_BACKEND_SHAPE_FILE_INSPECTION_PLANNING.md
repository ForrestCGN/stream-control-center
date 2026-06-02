# EVENTBUS CAN-22.1 - Safety Architecture Backend Shape File Inspection Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-22.1

## Zweck

CAN-22.1 prueft und dokumentiert die echten GitHub/dev-Dateien, die fuer eine spaetere interne Safety-Architecture-Backend-Shape-Planung relevant waeren.

Wichtig:

```text
Dies ist nur Datei-Inspektion/Planung/Dokumentation.
Keine Code-Aenderung.
Keine API.
Keine Route.
Keine Middleware.
Kein EventBus-Emit.
Keine DB-Migration.
Keine Speicherung.
Keine Dashboard-Aenderung.
Keine Recovery-Ausfuehrung.
Keine Queue-, Sound-, Alert- oder Overlay-Mutation.
Kein Validation-Code.
```

## Gepruefte echte Dateien

Aus GitHub/dev geprueft:

```text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
htdocs/dashboard/modules/bus_diagnostics.js
```

## Harte Grenze fuer CAN-22.1

CAN-22.1 darf nicht enthalten:

```text
Code-Aenderung
API
Route
DB
Middleware
Dashboard-Aenderung
EventBus-Emit
Recovery-Ausfuehrung
SafetyStop Clear
Confirm Trigger
Rollen-/Rechte-Mutation
Queue-/Sound-/Alert-/Overlay-Mutation
Validation-Code
```

## Inspektion: backend/modules/bus_diagnostics.js

### Grunddaten

Gefundener Stand:

```text
MODULE = bus_diagnostics
VERSION = 1.2.9
STATUS_API_VERSION = 1.0.0
build = STEP_CAN9_4
```

### Routen

Vorhandene Routen:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/check
GET /api/bus-diagnostics/recovery-preflight
GET /api/bus-diagnostics/recovery-simulation/status
GET /api/bus-diagnostics/recovery-simulation/test
GET /api/bus-diagnostics/routes
```

Bewertung:

```text
Alle relevanten bus_diagnostics-Routen sind GET/read-only.
Keine POST-/Prepare-/Execute-Route in bus_diagnostics gefunden.
```

### Bestehende zentrale Funktionen

Gefundene/erkennbare Funktionen:

```text
init(ctx)
registerGet(app, routePath, handler)
buildStatus(query, requestedCheck)
buildRecoveryPreflightRouteResponse(statusResult, requestedCheck)
analyze(parts)
buildRecoveryReadiness(input)
buildRecoveryPreflight(input)
buildRecoverySimulationStatus()
buildRecoverySimulationTest(query)
buildRecoveryStrategyState(correlationBody)
buildResilienceMatrix(parts)
compactFetch(fetchResult)
fetchJson(url)
errorResponse(err)
```

### Bestehende Sicherheitsfelder

`buildStatus()` liefert bereits:

```text
readOnly: true
flowTouched: false
queueTouched: false
soundSystemTouched: false
alertSystemTouched: false
vipSystemTouched: false
overlayTouched: false
```

`buildRecoveryPreflightRouteResponse()` liefert bereits:

```text
readOnly: true
automationEnabled: false
productiveActions: false
canPrepare: false
canExecute: false
routeSafety.method: GET
routeSafety.commandRoute: false
routeSafety.executeRoute: false
routeSafety.prepareRoute: false
routeSafety.recoveryExecution: false
```

### Relevanz fuer spaetere Safety Architecture Backend Shape

Geeignet als wahrscheinlichster Ort fuer spaetere interne read-only Shape-Funktion:

```text
backend/modules/bus_diagnostics.js
```

Begruendung:

```text
Das Modul aggregiert bereits Status, Recovery Strategy, Recovery Readiness, Recovery Preflight, Resilience Matrix und route safety.
```

### Spaeter moegliche interne Funktion

Nur Planung:

```text
buildSafetyArchitectureStatusShape(statusResult)
```

oder:

```text
buildSafetyArchitectureStatus()
```

Empfohlene Grenze:

```text
pure/read-only
kein Fetch zusaetzlicher produktiver Aktionen
keine DB
keine Config Writes
keine Queue/Sound/Alert/Overlay Mutation
keine Route in erstem Schritt
```

## Inspektion: backend/modules/communication_bus.js

### Grunddaten

Gefundener Stand:

```text
MODULE_META.name = communication_bus
version = 0.8.3
build = STEP278
coreName = communication_core
coreVersion = 0.3.0
```

### Relevante Funktionen/Strukturen

Gefunden:

```text
loadCommunicationConfig()
getBus()
handleWsMessage()
handleHello()
handleHeartbeat()
handleAck()
analyzeWatchdog()
buildModuleResponse()
init({ app })
```

### Wichtige Routen

Vorhandene Routen und Hinweise:

```text
GET /api/communication/status
GET /api/communication/settings
POST /api/communication/settings
POST /api/communication/settings/reset-defaults
GET /api/communication/test
GET /api/communication/test-alert
GET /api/communication/mirror-alert
GET /api/communication/ack
GET /api/communication/replay
GET /api/communication/watchdog
GET /api/communication/issue
GET /api/communication/client/forget
GET /api/communication/test-vip-overlay-preview
GET /api/communication/test-vip-overlay
GET /api/communication/reset
```

### Bewertung fuer Safety Architecture Shape

`communication_bus.js` ist relevant als Statusquelle, aber nicht als erster Ort fuer Safety-Architecture-Shape-Logik.

Grund:

```text
communication_bus enthaelt echte Bus-Funktionen, Settings-DB, Emits, Replay, Watchdog, Reset und Test-Endpunkte.
Safety Architecture Shape soll keine neuen Emits, keine Mutationen und keine Settings-DB anfassen.
```

### Wichtige Vorsicht

In `communication_bus.js` existieren produktiv-nahe/test-/diagnosebezogene Emit-/Replay-/Reset-Funktionen.

Deshalb gilt:

```text
Fuer CAN-22.x keine Aenderung an communication_bus.js.
Fuer spaeter nur lesend ueber vorhandenen Status verwenden.
Keine neue Safety-Shape-Logik dort einbauen, solange nicht separat geplant.
```

## Inspektion: htdocs/dashboard/modules/bus_diagnostics.js

### Grunddaten

Gefundene Struktur:

```text
Browser/Dashboard IIFE
MODULE = BusDiagnosticsModule
panelId = busDiagnosticsModule
state.lastData
state.recoverySubTab
state.manualDiagnosticsRefresh*
state.manualStatusResync*
```

### Vorhandene Tabs

Gefunden:

```text
overview
clients
events
integrations
recovery
issues
config
raw
```

### Vorhandene API-Aufrufe

Gefunden:

```text
/api/bus-diagnostics/status
/api/bus-diagnostics/check
/api/bus-diagnostics/recovery-preflight
/api/communication/settings
```

### Vorhandene Safety-Status-Funktionen

Gefunden:

```text
uniqueStrings()
safetyLevelLabel()
safetyBoolText()
safetyRow()
safetyHardBlockerRow()
hardBlockedActionLabel()
buildSafetyStatusModel()
renderSafetyStatusView()
```

### Vorhandene Safety-Status-Logik

`buildSafetyStatusModel()` wertet bereits aus:

```text
readOnly
canPrepare
canExecute
recoveryExecution
dangerousRoutesPresent
productiveMutationPresent
routeSafety.method
commandRoute
prepareRoute
executeRoute
postRoutePresent
guardCount
guardWarnings
guardBlocked
guardBlocking
guardErrors
hardBlockedActions
```

### Bewertung fuer spaetere Dashboard-Anzeige

`htdocs/dashboard/modules/bus_diagnostics.js` ist geeignet fuer spaetere reine read-only Anzeige, aber erst nach separater Freigabe.

CAN-22.1 aendert diese Datei nicht.

## Inspektionsentscheidung

Der wahrscheinlich sinnvollste technische Pfad fuer spaeter:

```text
1. Interne read-only Shape-Funktion in backend/modules/bus_diagnostics.js planen
2. Keine Route im ersten technischen Schritt
3. Keine Aenderung an communication_bus.js
4. Dashboard erst spaeter separat planen
```

## Potenziell sichere spaetere Implementierungsvariante

Nur Planung:

```text
backend/modules/bus_diagnostics.js
  + buildSafetyArchitectureStatusShape(statusResult)
  + validateSafetyArchitectureStatusShape(shape)
  + Shape in bestehender /api/bus-diagnostics/status Response optional einbetten
```

Aber:

```text
Auch das ist noch nicht freigegeben.
CAN-22.1 baut nichts.
```

## Alternative spaetere Implementierungsvariante

Noch defensiver:

```text
Nur interne Funktion planen, nicht exportieren, nicht in Response einbetten.
```

Vorteil:

```text
geringstes Risiko
keine API-/Dashboard-Verhaltensaenderung
```

Nachteil:

```text
ohne Code-Nutzung nicht sichtbar/testbar
```

## Empfehlung fuer CAN-22.2

Naechster sicherer Schritt:

```text
CAN-22.2 - Safety Architecture Backend Shape Implementation Candidate Decision no-code
```

Ziel:

```text
Entscheiden, ob spaeter nur eine interne Funktion geplant wird oder ob eine bestehende read-only Status-Response erweitert werden duerfte.
```

## Weiterhin nicht freigegeben

```text
Code schreiben
Route bauen
Response erweitern
Dashboard aendern
EventBus emitten
DB anfassen
Recovery vorbereiten
Recovery ausfuehren
```

## Ergebnis CAN-22.1

CAN-22.1 definiert:

```text
gepruefte echte Dateien
bus_diagnostics.js Ist-Struktur
communication_bus.js Ist-Struktur und Vorsicht
dashboard bus_diagnostics.js Ist-Struktur
wahrscheinlich sinnvollster technischer Pfad
moegliche spaetere Funktionsnamen
weiterhin harte No-Go-Grenzen
naechste Entscheidungsrichtung
```
