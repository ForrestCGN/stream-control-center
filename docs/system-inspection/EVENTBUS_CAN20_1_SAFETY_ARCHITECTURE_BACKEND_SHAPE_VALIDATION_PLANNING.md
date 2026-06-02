# EVENTBUS CAN-20.1 - Safety Architecture Backend Shape Validation Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-20.1

## Zweck

CAN-20.1 plant, wie ein spaeteres internes Safety-Architecture-Backend-Shape validiert werden muesste.

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

CAN-20.0 hat das Safety Architecture Backend Shape read-only/no-route geplant.

CAN-20.1 plant nun die Validierungsregeln fuer dieses spaetere Shape, ohne Validierungscode zu bauen.

## Harte Grenze fuer CAN-20.1

CAN-20.1 darf nicht enthalten:

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
Validation-Code
```

## Validierungsziel

Eine spaetere Validierung soll sicherstellen:

```text
Pflichtfelder vorhanden
Typen korrekt
readOnly bleibt true
hasRoute/hasApi/hasMutation bleiben false
High-risk bleibt blockiert
Module melden keine unerwartete Mutation
technicalBoundaries widersprechen nicht dem Root
Warnings/Errors sind eindeutig
```

CAN-20.1 baut diese Validierung nicht.

## Pflichtfeld-Checks

Root-Pflichtfelder aus CAN-20.0:

```text
ok
module
contract
contractVersion
readOnly
hasRoute
hasApi
hasMutation
generatedAt
overall
modules
hardBlockedActions
technicalBoundaries
warnings
notes
```

Wenn ein Pflichtfeld fehlt:

```text
level = error
ok = false
Aktion = blockieren
```

## Typregeln

Geplante Typen:

```text
ok: boolean
module: string
contract: string
contractVersion: string
readOnly: boolean
hasRoute: boolean
hasApi: boolean
hasMutation: boolean
generatedAt: string ISO-8601
overall: object
modules: object
hardBlockedActions: array
technicalBoundaries: object
warnings: array
notes: array
```

Wenn ein Typ falsch ist:

```text
level = error
ok = false
Aktion = blockieren
```

## Root-Sicherheitschecks

Diese Werte muessen spaeter fuer den read-only/no-route-Strang gelten:

```text
readOnly === true
hasRoute === false
hasApi === false
hasMutation === false
```

Wenn eine Abweichung gefunden wird:

```text
level = error
ok = false
Aktion = blockieren
```

## Overall Checks

Pflichtfelder fuer `overall`:

```text
level
label
message
architectureConsolidated
allHighRiskBlocked
canPrepare
canExecute
recoveryExecution
```

Erwartete Sicherheitswerte:

```text
architectureConsolidated: true
allHighRiskBlocked: true
canPrepare: false
canExecute: false
recoveryExecution: false
```

Abweichung:

```text
level = error oder blocked
Aktion = blockieren
```

## Module Checks

Erwartete Module:

```text
audit
safetyStop
rolesRights
confirm
recoveryExecution
```

Jedes Modul soll haben:

```text
id
label
level
status
readOnly
implemented
planningComplete
hasApi
hasRoute
hasMutation
missingPrerequisites
blockedActions
notes
```

Optionale bausteinspezifische Felder:

```text
hasDb
hasMiddleware
hasButton
hasToken
hasPrepareRoute
hasExecuteRoute
canPrepare
canExecute
```

## Modul-Sicherheitschecks

Fuer alle Module gilt:

```text
readOnly === true
hasApi === false
hasRoute === false
hasMutation === false
```

Wenn ein Modul Mutation/API/Route meldet:

```text
level = error
ok = false
Aktion = blockieren
```

## RecoveryExecution Checks

RecoveryExecution muss spaeter weiterhin blockiert bleiben:

```text
level: blocked
status: blocked
canPrepare: false
canExecute: false
hasPrepareRoute: false
hasExecuteRoute: false
hasMutation: false
```

Abweichung:

```text
level = error
ok = false
Aktion = blockieren
```

## HardBlockedActions Checks

Jeder HardBlocker braucht:

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

Erwartete Werte:

```text
blocked: true
level: blocked
hasButton: false
hasRoute: false
hasMutation: false
```

Wenn ein HardBlocker nicht blockiert ist:

```text
level = error
ok = false
Aktion = blockieren
```

## Pflicht-HardBlocker

Mindestens diese Aktionen muessen spaeter weiter enthalten sein:

```text
alert_replay
sound_replay
queue_clear
overlay_state_repair
recovery_execute
auto_recovery
auto_retry_overlay
streamerbot_action_retry
obs_source_refresh
safetystop_clear
safetystop_reset
audit_write_route
audit_read_route
confirm_api
confirm_execution
roles_rights_mutation
prepare_route
execute_route
post_command_route
```

Wenn einer fehlt:

```text
level = warning/error
Aktion = blockieren
```

## TechnicalBoundaries Checks

Pflichtfelder:

```text
api
route
db
middleware
dashboardMutation
eventBusEmit
recoveryExecution
queueMutation
soundMutation
alertMutation
overlayMutation
obsAction
streamerbotAction
```

Erwartete Werte:

```text
alle false
```

Wenn einer true ist:

```text
level = error
ok = false
Aktion = blockieren
```

## Warning-Regeln

Warnings sollen maschinenlesbar und kurz sein.

Geplante Warning-Form:

```json
{
  "id": "missing_data_source",
  "level": "warning",
  "message": "Safety Architecture has no technical runtime source yet."
}
```

Pflichtfelder:

```text
id
level
message
```

Erlaubte Level:

```text
warning
error
blocked
unknown
```

## Notes-Regeln

Notes sind kurze Strings.

Erlaubte Beispiele:

```text
planned_not_implemented
readonly_only
no_route
no_api
no_mutation
high_risk_blocked
client_not_authority
confirm_is_not_execution
```

Keine Secrets in Notes.

## Fail-safe-Regeln

Wenn Validierung spaeter nicht ausgefuehrt werden kann:

```text
blockieren
```

Wenn Validierung widerspruechliche Daten findet:

```text
blockieren
```

Wenn ein Modul unbekannt ist:

```text
warning/block
keine Aktion erlauben
```

Wenn technische Mutation unerwartet verfuegbar ist:

```text
error
keine Aktion erlauben
```

## No-code-Regel

CAN-20.1 erstellt nicht:

```text
validateSafetyArchitectureShape()
validator.js
schema.json
test fixtures
unit tests
backend helper
route handler
dashboard renderer
```

## No-route-Regel

CAN-20.1 erstellt nicht:

```text
GET /api/safety-architecture
GET /api/bus-diagnostics/safety-architecture
POST /api/safety-architecture/validate
```

## Ergebnis CAN-20.1

CAN-20.1 definiert:

```text
Validierungsziel
Pflichtfeld-Checks
Typregeln
Root-Sicherheitschecks
Overall Checks
Module Checks
RecoveryExecution Checks
HardBlockedActions Checks
Pflicht-HardBlocker
TechnicalBoundaries Checks
Warning-Regeln
Notes-Regeln
Fail-safe-Regeln
No-code-/No-route-Regeln
```

## Naechster sinnvoller Schritt

```text
CAN-20.2 - Safety Architecture Backend Shape Planning Closure / Handoff
```
