# EVENTBUS CAN-19.3 - Safety Architecture Contracts Consolidation Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-19.3

## Zweck

CAN-19.3 konsolidiert die bisher geplanten Display-/Status-Contracts fuer Audit, SafetyStop, Roles/Rights, Confirm und Hard Blocker zu einem gemeinsamen Contract-Konzept.

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

CAN-19.2 hat die Safety Architecture Implementation Readiness Matrix geplant.

Naechste sichere Richtung:

```text
Safety Architecture Contracts Consolidation Planning
```

## Harte Grenze fuer CAN-19.3

CAN-19.3 darf nicht enthalten:

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

## Ziel des gemeinsamen Contracts

Ein spaeterer gemeinsamer Contract soll read-only anzeigen koennen:

```text
welche Sicherheitsbausteine geplant sind
welche Bausteine technisch nicht implementiert sind
welche Risiken bewusst blockiert sind
welche Aktionen nicht moeglich sind
welche Voraussetzungen fehlen
welcher Gesamtstatus gilt
```

CAN-19.3 baut diesen Contract nicht technisch, sondern definiert nur ein gemeinsames Konzept.

## Gemeinsame Root-Felder

Geplante gemeinsame Felder:

```text
ok
section
contract
contractVersion
readOnly
hasApi
hasMutation
generatedAt
overallLevel
overallLabel
overallMessage
modules
hardBlockedActions
technicalBoundaries
notes
warnings
```

## Root-Feldregeln

### ok

Planungsregel:

```text
true = Contract konnte read-only erzeugt werden
false = Contract konnte nicht sauber erzeugt werden
```

### section

Geplanter Wert:

```text
safetyArchitecture
```

### contract

Geplanter Wert:

```text
safety_architecture_status_readonly
```

### contractVersion

Geplanter Wert:

```text
CAN-19.3
```

### readOnly

Muss fuer diesen Strang bleiben:

```text
true
```

### hasApi

Aktueller Planungsstand:

```text
false
```

### hasMutation

Muss bleiben:

```text
false
```

## Gemeinsame Status-Level

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
ok = read-only sicher/erwartet
planned = geplant, aber nicht technisch implementiert
warning = unvollstaendig oder noch nicht entscheidbar
blocked = bewusst blockiert
error = unerwartete Mutation/API/Route/Fehler
unknown = unbekannter Status, fail-safe behandeln
```

## Module-Struktur

Geplante Module:

```text
audit
safetyStop
rolesRights
confirm
recoveryExecution
hardBlockers
```

## Gemeinsamer Modul-Contract

Nur Planung:

```json
{
  "id": "audit",
  "label": "Audit",
  "status": "planned_only",
  "level": "planned",
  "readOnly": true,
  "hasApi": false,
  "hasDb": false,
  "hasMutation": false,
  "implemented": false,
  "planningComplete": true,
  "missingPrerequisites": [],
  "blockedActions": [],
  "notes": []
}
```

## Gemeinsame Modul-Felder

```text
id
label
status
level
readOnly
hasApi
hasDb
hasMutation
implemented
planningComplete
missingPrerequisites
blockedActions
notes
```

## Status-Werte fuer Module

```text
planned_only
readonly_available
readonly_planned
blocked
not_implemented
unknown
error
```

## Audit-Modul

Geplanter Zustand:

```text
status: planned_only
level: planned
readOnly: true
hasApi: false
hasDb: false
hasMutation: false
implemented: false
planningComplete: true
```

Fehlende Voraussetzungen:

```text
Audit DB/Storage
Retention technisch
Masking/Sanitizing technisch
Audit Read API
Audit Write Path
Audit Dashboard
Rechtepruefung
```

## SafetyStop-Modul

Geplanter Zustand:

```text
status: planned_only
level: planned
readOnly: true
hasApi: false
hasDb: false
hasMutation: false
implemented: false
planningComplete: true
```

Fehlende Voraussetzungen:

```text
Runtime-Statusquelle
Set/Clear-Regeln
Clear-Rechte
Audit-Kopplung
Confirm-Kopplung
Dashboard Anzeige
Fail-safe Runtime
```

## Roles/Rights-Modul

Geplanter Zustand:

```text
status: planned_only
level: planned
readOnly: true
hasApi: false
hasDb: false
hasMutation: false
implemented: false
planningComplete: true
```

Fehlende Voraussetzungen:

```text
Identity/Auth-Quelle
Rollenquelle
Rechtemodell technisch
Middleware
Audit-Kopplung
Dashboard Anzeige
Owner/Admin-Regeln
```

## Confirm-Modul

Geplanter Zustand:

```text
status: planned_only
level: planned
readOnly: true
hasApi: false
hasDb: false
hasMutation: false
implemented: false
planningComplete: true
```

Fehlende Voraussetzungen:

```text
Confirm Request Modell
Token/Nonce Konzept
TTL/Timeout Runtime
Cancel/Expire Handling
Audit-Kopplung
Rights/SafetyStop/Guards Kopplung
Dashboard Anzeige
```

## RecoveryExecution-Modul

Geplanter Zustand:

```text
status: blocked
level: blocked
readOnly: true
hasApi: false
hasDb: false
hasMutation: false
implemented: false
planningComplete: false
```

Grund:

```text
Recovery-Ausfuehrung bleibt blockiert.
Prepare/Execute Routen existieren nicht.
```

## HardBlockers-Struktur

Geplante gemeinsame Struktur:

```json
{
  "id": "recovery_execute",
  "label": "Recovery Execute",
  "blocked": true,
  "level": "blocked",
  "reason": "high_risk_not_implemented",
  "requiresSeparatePlanning": true,
  "hasButton": false,
  "hasRoute": false,
  "hasMutation": false
}
```

## HardBlocker Pflichtfelder

```text
id
label
blocked
level
reason
requiresSeparatePlanning
hasButton
hasRoute
hasMutation
```

## Gemeinsame technische Grenzen

Geplanter Block:

```json
{
  "api": false,
  "route": false,
  "db": false,
  "middleware": false,
  "dashboardMutation": false,
  "eventBusEmit": false,
  "recoveryExecution": false,
  "queueMutation": false,
  "soundMutation": false,
  "alertMutation": false,
  "overlayMutation": false
}
```

## Notes/Warnungen

Gemeinsame Notes sollen kurz und eindeutig sein.

Beispiele:

```text
planned_not_implemented
readonly_only
no_action_available
high_risk_blocked
missing_backend_shape
missing_data_source
```

## Vollstaendiges Contract-Beispiel

Nur Planung:

```json
{
  "ok": true,
  "section": "safetyArchitecture",
  "contract": "safety_architecture_status_readonly",
  "contractVersion": "CAN-19.3",
  "readOnly": true,
  "hasApi": false,
  "hasMutation": false,
  "generatedAt": "ISO-8601",
  "overallLevel": "planned",
  "overallLabel": "Sicherheitsarchitektur geplant",
  "overallMessage": "Audit, SafetyStop, Roles/Rights und Confirm sind geplant, aber nicht technisch aktiv.",
  "modules": {},
  "hardBlockedActions": [],
  "technicalBoundaries": {},
  "notes": [],
  "warnings": []
}
```

## No-Implementation-Regel

CAN-19.3 erstellt nicht:

```text
Contract-Datei im Backend
API Response
Route
Dashboard Renderer
EventBus Message
DB Schema
Config-Datei
Mock-Daten
```

## No-Mock-Regel

Nicht erlaubt:

```text
Fake Audit-Daten
Fake Rollen
Fake SafetyStop Status
Fake Confirm Status
Fake Recovery Status
```

Erlaubt nur als Planung:

```text
statischer Hinweis planned_only
statischer Hinweis not_implemented
statischer Hinweis blocked
```

## Fail-safe-Regel

Wenn spaeter ein Modul unbekannt ist:

```text
level = warning oder blocked
Aktion = nicht erlaubt
```

Wenn spaeter eine Mutation unerwartet verfuegbar ist:

```text
level = error
Aktion = blockieren
```

## Harte Blocker bleiben

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

## Ergebnis CAN-19.3

CAN-19.3 definiert:

```text
gemeinsame Root-Felder
Root-Feldregeln
gemeinsame Status-Level
Module-Struktur
gemeinsamer Modul-Contract
Baustein-spezifische Modulzustaende
HardBlocker-Struktur
technische Grenzen
Notes/Warnungen
vollstaendiges Contract-Beispiel
No-Implementation-/No-Mock-Regeln
Fail-safe-Regel
```

## Naechster sinnvoller Schritt

```text
CAN-19.4 - Safety Architecture Planning Closure / Handoff
```
