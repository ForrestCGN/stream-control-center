# EVENTBUS CAN-19.1 - Safety Architecture Status Display Planning read-only/no-api

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-19.1

## Zweck

CAN-19.1 plant, wie der Gesamtstatus der Recovery-/Safety-Architektur spaeter read-only angezeigt werden koennte.

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
```

## Ausgangslage

CAN-19.0 hat die Recovery Safety Architecture konsolidiert.

Konsolidierte Bausteine:

```text
Audit Planning no-write/no-data
SafetyStop Planning read-only/no-api
Roles/Rights Planning no-mutation/no-implementation
Confirm Planning no-action/no-implementation
```

CAN-19.1 plant nun eine reine Statusanzeige fuer diese Gesamtarchitektur, ohne sie zu bauen.

## Harte Grenze fuer CAN-19.1

CAN-19.1 darf nicht enthalten:

```text
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
```

## Moeglicher spaeterer Anzeige-Ort

Nur Planung:

```text
Event-Bus / Communication Bus
Recovery
Safety Architecture
```

Alternative:

```text
Admin / System
Safety Architecture
```

Entscheidung:

```text
Noch offen.
Keine Dashboard-Datei in CAN-19.1 aendern.
```

## Statuskarten fuer spaeter

Moegliche Karten:

```text
Gesamtstatus
Audit
SafetyStop
Roles/Rights
Confirm
Harte Blocker
Technische Grenzen
Naechste sichere Schritte
```

## Gesamtstatus-Karte

Moegliche Felder:

```text
architectureConsolidated
readOnly
canPrepare
canExecute
recoveryExecution
dashboardRecoveryButtons
hardBlockedCount
lastUpdated
```

Default fuer aktuellen Stand:

```text
architectureConsolidated: true
readOnly: true
canPrepare: false
canExecute: false
recoveryExecution: false
dashboardRecoveryButtons: false
```

## Audit-Karte

Soll spaeter anzeigen:

```text
Audit Planning vorhanden
Boundary no-write vorhanden
Event Catalog vorhanden
Data Minimization Policy vorhanden
Display Planning vorhanden
Write API nicht vorhanden
Read API nicht vorhanden
DB nicht vorhanden
Dashboard nicht vorhanden
```

Status:

```text
planned_only
```

## SafetyStop-Karte

Soll spaeter anzeigen:

```text
SafetyStop Planning vorhanden
State Matrix vorhanden
Display Contract vorhanden
Integration Boundary vorhanden
API nicht vorhanden
DB nicht vorhanden
Dashboard nicht vorhanden
Set/Clear/Reset nicht vorhanden
```

Status:

```text
planned_only
```

## Roles/Rights-Karte

Soll spaeter anzeigen:

```text
Roles/Rights Planning vorhanden
Action Matrix vorhanden
Backend Boundary vorhanden
Display Boundary vorhanden
API nicht vorhanden
DB nicht vorhanden
Middleware nicht vorhanden
Durchsetzung nicht vorhanden
```

Status:

```text
planned_only
```

## Confirm-Karte

Soll spaeter anzeigen:

```text
Confirm Planning vorhanden
Action Matrix vorhanden
Display Boundary vorhanden
API nicht vorhanden
Token nicht vorhanden
DB nicht vorhanden
Button nicht vorhanden
Execution nicht vorhanden
```

Status:

```text
planned_only
```

## Harte-Blocker-Karte

Soll spaeter anzeigen:

```text
Alert Replay
Sound Replay
Queue Clear
Overlay State Repair
Execute Recovery
Auto Recovery
Auto Retry Overlay
Streamer.bot Action Retry
OBS Source Refresh
SafetyStop Clear
SafetyStop Reset
Audit Write Route
Audit Read Route
Confirm API
Confirm Execution
Rollen-/Rechte-Mutation
Prepare Route
Execute Route
POST Command Route
```

Darstellung:

```text
bewusst blockiert
keine Aktion
keine Buttons
```

## Technische-Grenzen-Karte

Soll spaeter anzeigen:

```text
Keine API
Keine Route
Keine DB
Keine Middleware
Kein EventBus-Emit
Keine Dashboard-Aenderung
Keine Recovery-Ausfuehrung
Keine Mutation
```

## Status-Level

Empfohlene Level:

```text
ok
planned
warning
blocked
error
unknown
```

Mapping:

```text
readOnly true -> ok
planned but not implemented -> planned
high-risk blocked -> blocked
unknown safety state -> warning/block
unexpected mutation capability -> error
```

## Display Contract fuer spaeter

Nur Planung:

```json
{
  "section": "safetyArchitecture",
  "contractVersion": "CAN-19.1",
  "readOnly": true,
  "hasApi": false,
  "hasMutation": false,
  "architectureConsolidated": true,
  "overallLevel": "ok",
  "overallLabel": "Read-only geplant",
  "modules": {
    "audit": { "status": "planned_only", "api": false, "db": false, "mutation": false },
    "safetyStop": { "status": "planned_only", "api": false, "db": false, "mutation": false },
    "rolesRights": { "status": "planned_only", "api": false, "db": false, "mutation": false },
    "confirm": { "status": "planned_only", "api": false, "db": false, "mutation": false }
  },
  "hardBlockedActions": [],
  "notes": []
}
```

## Pflichtfelder fuer spaetere Anzeige

```text
section
contractVersion
readOnly
hasApi
hasMutation
architectureConsolidated
overallLevel
overallLabel
modules
hardBlockedActions
```

## No-Button-Regel

Diese Anzeige darf spaeter keine produktiven Buttons enthalten.

Nicht erlaubt:

```text
Recovery starten
Prepare starten
Execute starten
SafetyStop clearen
Confirm starten
Audit schreiben
Rolle setzen
Queue leeren
Alert/Sound replay
Overlay reparieren
OBS refresh
Streamer.bot retry
```

## No-API-Regel

CAN-19.1 plant keine API.

Nicht erstellen:

```text
GET /api/safety-architecture
GET /api/recovery-safety/architecture
GET /api/bus-diagnostics/safety-architecture
POST /api/safety-architecture
```

## No-Mock-Regel

Keine Fake-Sicherheitsdaten verwenden.

Erlaubt spaeter nur:

```text
echte read-only Statuswerte aus vorhandenen Quellen
statischer Hinweis "geplant, nicht implementiert"
```

Nicht erlaubt:

```text
Pseudo-Audit-Eintraege
Fake-Rollen
Fake-SafetyStop-State
Fake-Confirm-State
```

## UX-Regeln

Eine spaetere Anzeige muss klar machen:

```text
geplant ist nicht implementiert
blocked ist bewusst blockiert
read-only ist keine Freigabe
keine Buttons bedeutet keine Aktion
unknown ist nicht OK
```

## Datenschutzregel

Statusanzeige darf keine Secrets zeigen.

Nicht anzeigen:

```text
Tokens
Cookies
Authorization Header
Session IDs
API Keys
private Rohdaten
```

## Ergebnis CAN-19.1

CAN-19.1 definiert:

```text
moegliche Anzeigeorte
Statuskarten
Gesamtstatus-Felder
Baustein-Karten fuer Audit/SafetyStop/RolesRights/Confirm
Harte-Blocker-Karte
Technische-Grenzen-Karte
Status-Level
Display Contract
No-Button-/No-API-/No-Mock-Regeln
UX-/Datenschutzregeln
```

## Naechster sinnvoller Schritt

```text
CAN-19.2 - Safety Architecture Implementation Readiness Matrix Planning
```
