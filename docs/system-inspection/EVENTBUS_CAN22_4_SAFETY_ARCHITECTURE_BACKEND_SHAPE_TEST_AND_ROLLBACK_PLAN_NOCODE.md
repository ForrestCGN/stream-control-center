# EVENTBUS CAN-22.4 - Safety Architecture Backend Shape Test and Rollback Plan no-code

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-22.4

## Zweck

CAN-22.4 plant, welche Tests, Abnahmen und Rollback-Grenzen fuer eine spaetere echte Implementierung der internen Safety-Architecture-Backend-Shape-Funktion notwendig waeren.

Wichtig:

```text
Dies ist nur Planung/Dokumentation.
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

## Ausgangslage

CAN-22.3 hat den spaeteren internen Funktionsplan definiert:

```text
buildSafetyArchitectureStatusShape(statusResult)
```

Primaere spaetere Zieldatei:

```text
backend/modules/bus_diagnostics.js
```

CAN-22.4 plant nun Tests, Abnahme und Rollback fuer einen spaeteren echten Code-Step.

## Harte Grenze fuer CAN-22.4

CAN-22.4 darf nicht enthalten:

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

## Spaeter erlaubter Minimal-Code-Scope

Nur fuer einen spaeteren, separat freigegebenen Code-Step denkbar:

```text
backend/modules/bus_diagnostics.js
```

Nicht im ersten Code-Step erlaubt:

```text
backend/modules/communication_bus.js
htdocs/dashboard/modules/bus_diagnostics.js
config/*
data/*
```

Ausnahme nur nach neuer ausdruecklicher Freigabe.

## Spaeterer Minimal-Testumfang

Wenn spaeter nur `backend/modules/bus_diagnostics.js` geaendert wird:

```bat
node -c backend\modules\bus_diagnostics.js
```

## Erweiterter Syntax-Testumfang

Nur wenn diese Dateien spaeter wirklich geaendert werden:

```bat
node -c backend\modules\communication_bus.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

## Runtime-Checks fuer spaeter

Nach einer spaeteren echten Umsetzung muessen bestehende read-only Routen weiter funktionieren:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/check
GET /api/bus-diagnostics/recovery-preflight
GET /api/bus-diagnostics/routes
```

Erwartung:

```text
HTTP 200
ok-Feld vorhanden
readOnly bleibt true
keine produktiven Touch-Felder true
keine Prepare-/Execute-Faehigkeit
```

## Response-Sicherheitschecks

Wenn spaeter ein Shape intern erzeugt wird, muessen diese Werte erhalten bleiben:

```text
readOnly: true
hasRoute: false
hasApi: false
hasMutation: false
```

Fuer bestehende Statusdaten weiterhin:

```text
flowTouched: false
queueTouched: false
soundSystemTouched: false
alertSystemTouched: false
vipSystemTouched: false
overlayTouched: false
```

Fuer Recovery-/Preflight-Sicherheit weiterhin:

```text
canPrepare: false
canExecute: false
automationEnabled: false
productiveActions: false
routeSafety.commandRoute: false
routeSafety.prepareRoute: false
routeSafety.executeRoute: false
routeSafety.recoveryExecution: false
```

## Negative Checks

Eine spaetere Umsetzung darf nicht einfuehren:

```text
POST /api/bus-diagnostics/*
PUT /api/bus-diagnostics/*
PATCH /api/bus-diagnostics/*
DELETE /api/bus-diagnostics/*
GET /api/bus-diagnostics/safety-architecture
Prepare Route
Execute Route
Command Route
Recovery Route mit Aktion
SafetyStop Clear Route
Confirm Route
Audit Write Route
Roles/Rights Mutation Route
```

## Code-Review-Checks

Bei spaeterem Code muessen diese Begriffe kritisch gesucht werden:

```text
app.post
app.put
app.patch
app.delete
registerPost
registerPut
registerPatch
registerDelete
fs.write
writeFile
database.
db.
emit(
currentBus.emit
RunAction
OBS
obs.
queue
soundSystemTouched: true
alertSystemTouched: true
overlayTouched: true
canPrepare: true
canExecute: true
recoveryExecution: true
```

Hinweis:

```text
Nicht jeder Treffer ist automatisch falsch, aber jeder Treffer muss begruendet und fuer diesen Step wahrscheinlich ausgeschlossen werden.
```

## Rollback-Grenze

Ein spaeterer erster Code-Step muss rollback-freundlich bleiben:

```text
nur eine Datei
keine DB-Migration
keine Config-Aenderung
keine neue Route
keine Dashboard-Aenderung
keine EventBus-Aenderung
keine produktiven Side Effects
```

Primaerer Rollback:

```text
backend/modules/bus_diagnostics.js aus vorherigem Git-Stand wiederherstellen
```

## Abnahme-Kriterien fuer spaeteren Code-Step

Ein spaeterer Code-Step darf nur als abgenommen gelten, wenn:

```text
node -c backend\modules\bus_diagnostics.js erfolgreich
keine neue Route
keine neue API
keine DB-Aenderung
keine Dashboard-Aenderung
keine EventBus-Emission
kein Recovery-Prepare
kein Recovery-Execute
readOnly true
canPrepare false
canExecute false
hasMutation false
HardBlocker vollstaendig
```

## Nicht ausreichende Abnahme

Nicht ausreichend waere:

```text
nur ZIP erstellt
nur keine Syntaxfehler behauptet
nur optisch im Dashboard sichtbar
nur manuell kurz getestet
```

Es muss explizit dokumentiert werden:

```text
welche Datei geaendert wurde
welche Tests ausgefuehrt wurden
welche Checks bestanden wurden
was bewusst nicht geaendert wurde
Rollback-Hinweis
```

## Empfohlene spaetere Code-Step-Grenze

Wenn spaeter Code freigegeben wird, sollte der erste echte Step heissen:

```text
CAN-23.0 - Safety Architecture Backend Shape Internal Function read-only implementation
```

Erlaubter Inhalt fuer CAN-23.0 nur nach Freigabe:

```text
interne Funktion in backend/modules/bus_diagnostics.js
keine Einbindung in Response
keine Route
keine API
keine Dashboard-Aenderung
```

## Noch davor sinnvoller Abschluss

Vor CAN-23.0 sollte CAN-22 abgeschlossen werden.

Naechster sinnvoller Schritt:

```text
CAN-22.5 - Safety Architecture Backend Shape Planning Closure / Handoff
```

## Ergebnis CAN-22.4

CAN-22.4 definiert:

```text
Minimal-Code-Scope fuer spaeter
Syntax-Tests
Runtime-Checks
Response-Sicherheitschecks
Negative Checks
Code-Review-Checks
Rollback-Grenze
Abnahme-Kriterien
Nicht ausreichende Abnahme
spaetere Code-Step-Grenze
naechster Closure-Schritt
```
