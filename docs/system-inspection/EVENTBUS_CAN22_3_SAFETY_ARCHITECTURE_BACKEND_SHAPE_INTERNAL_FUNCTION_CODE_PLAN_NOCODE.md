# EVENTBUS CAN-22.3 - Safety Architecture Backend Shape Internal Function Code Plan no-code

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-22.3

## Zweck

CAN-22.3 plant konkret, wie eine spaetere interne Funktion fuer ein Safety-Architecture-Backend-Shape in `backend/modules/bus_diagnostics.js` aussehen duerfte.

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

CAN-22.2 hat als sichersten spaeteren technischen Kandidaten entschieden:

```text
Kandidat A - nur interne Funktion in backend/modules/bus_diagnostics.js, nicht eingebunden
```

Moeglicher Funktionsname:

```text
buildSafetyArchitectureStatusShape(statusResult)
```

CAN-22.3 plant diesen Kandidaten genauer, schreibt aber keinen Code.

## Harte Grenze fuer CAN-22.3

CAN-22.3 darf nicht enthalten:

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

## Ziel der spaeteren internen Funktion

Die Funktion soll spaeter ein internes read-only Objekt erzeugen, das den geplanten Sicherheitsarchitektur-Status abbildet.

Sie darf spaeter nur vorhandene, bereits geladene Diagnose-/Statusdaten auswerten.

Nicht erlaubt:

```text
neue Fetches
neue Routen
DB-Zugriffe
Config Writes
EventBus Emits
Queue-/Sound-/Alert-/Overlay-Aktionen
Recovery Prepare/Execute
```

## Primaere Zieldatei

Spaeter primaer betroffen:

```text
backend/modules/bus_diagnostics.js
```

Grund:

```text
Das Modul enthaelt bereits buildStatus(), analyze(), buildRecoveryReadiness(), buildRecoveryPreflight(), buildResilienceMatrix() und read-only Safety-/Recovery-Felder.
```

## Moegliche Position in der Datei

Nur Planung:

```text
Nach buildRecoveryPreflight(input)
oder
nach summarizePreflightChecks(checks)
oder
vor buildRecoverySimulationStatus()
```

Empfehlung:

```text
Nach buildRecoveryPreflight(input), weil dort die Safety-/Preflight-Struktur bereits abgeschlossen ist.
```

## Moeglicher Funktionsname

Empfohlen:

```text
buildSafetyArchitectureStatusShape(statusResult)
```

Alternative:

```text
buildSafetyArchitectureShape(statusResult)
buildSafetyArchitectureReadonlyShape(statusResult)
```

Entscheidung:

```text
buildSafetyArchitectureStatusShape(statusResult)
```

Begruendung:

```text
klarer Bezug auf Safety Architecture
klarer Bezug auf Status Shape
keine Verwechslung mit Route/API
```

## Eingabe der spaeteren Funktion

Moegliche Eingabe:

```text
statusResult
```

Erwartete enthaltene Felder:

```text
summary
warnings
optionalInfo
errors
resilienceMatrix
recoveryStrategyState
recoveryReadiness
recoveryPreflight
```

Wichtig:

```text
Die Funktion darf statusResult nur lesen.
Die Funktion darf statusResult nicht veraendern.
```

## Ausgabe der spaeteren Funktion

Geplantes Root-Shape:

```json
{
  "ok": true,
  "module": "bus_diagnostics",
  "contract": "safety_architecture_status_shape_readonly",
  "contractVersion": "CAN-22.x",
  "readOnly": true,
  "hasRoute": false,
  "hasApi": false,
  "hasMutation": false,
  "generatedAt": "ISO-8601",
  "overall": {},
  "modules": {},
  "hardBlockedActions": [],
  "technicalBoundaries": {},
  "warnings": [],
  "notes": []
}
```

## Harte Default-Werte

Diese Werte muessen spaeter fest bleiben:

```text
readOnly: true
hasRoute: false
hasApi: false
hasMutation: false
```

Fuer technicalBoundaries:

```text
api: false
route: false
db: false
middleware: false
dashboardMutation: false
eventBusEmit: false
recoveryExecution: false
queueMutation: false
soundMutation: false
alertMutation: false
overlayMutation: false
obsAction: false
streamerbotAction: false
```

## Overall Shape Plan

Moegliche Felder:

```text
level
label
message
architectureConsolidated
allHighRiskBlocked
canPrepare
canExecute
recoveryExecution
readOnly
```

Geplante Werte:

```text
architectureConsolidated: true
allHighRiskBlocked: true
canPrepare: false
canExecute: false
recoveryExecution: false
readOnly: true
```

## Module Shape Plan

Geplante Module:

```text
audit
safetyStop
rolesRights
confirm
recoveryExecution
```

Gemeinsames Modul-Shape:

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
hasDb
hasMutation
missingPrerequisites
blockedActions
notes
```

## Audit Modul Plan

Geplante Werte:

```text
id: audit
label: Audit
level: planned
status: planned_only
readOnly: true
implemented: false
planningComplete: true
hasApi: false
hasRoute: false
hasDb: false
hasMutation: false
```

Missing prerequisites:

```text
audit_storage
retention_config
masking_sanitizing
rights_check
read_api
dashboard_display
```

Blocked actions:

```text
audit_write
audit_read_api
audit_export
audit_delete
```

## SafetyStop Modul Plan

Geplante Werte:

```text
id: safetyStop
label: SafetyStop
level: planned
status: planned_only
readOnly: true
implemented: false
planningComplete: true
hasApi: false
hasRoute: false
hasDb: false
hasMutation: false
```

Missing prerequisites:

```text
runtime_state_source
set_clear_rules
rights_check
audit_coupling
confirm_coupling
dashboard_display
```

Blocked actions:

```text
safetystop_set
safetystop_clear
safetystop_reset
```

## Roles/Rights Modul Plan

Geplante Werte:

```text
id: rolesRights
label: Roles/Rights
level: planned
status: planned_only
readOnly: true
implemented: false
planningComplete: true
hasApi: false
hasRoute: false
hasDb: false
hasMiddleware: false
hasMutation: false
```

Missing prerequisites:

```text
identity_source
auth_source
roles_source
permission_model
middleware
audit_coupling
dashboard_display
```

Blocked actions:

```text
role_assign
role_remove
permission_edit
rights_api
```

## Confirm Modul Plan

Geplante Werte:

```text
id: confirm
label: Confirm
level: planned
status: planned_only
readOnly: true
implemented: false
planningComplete: true
hasApi: false
hasRoute: false
hasDb: false
hasButton: false
hasToken: false
hasMutation: false
```

Missing prerequisites:

```text
confirm_request_model
token_nonce_concept
ttl_runtime
cancel_expire_handling
audit_coupling
rights_safetystop_guard_coupling
dashboard_display
```

Blocked actions:

```text
confirm_api
confirm_execute
confirm_button
confirm_token
```

## RecoveryExecution Modul Plan

Geplante Werte:

```text
id: recoveryExecution
label: Recovery Execution
level: blocked
status: blocked
readOnly: true
implemented: false
planningComplete: false
canPrepare: false
canExecute: false
hasPrepareRoute: false
hasExecuteRoute: false
hasMutation: false
```

Blocked actions:

```text
recovery_prepare
recovery_execute
auto_recovery
```

## HardBlockedActions Plan

Pflichtliste:

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

Jeder Eintrag soll spaeter enthalten:

```text
id
label
blocked: true
level: blocked
reason
requiresSeparatePlanning: true
hasButton: false
hasRoute: false
hasMutation: false
```

## Warnings / Notes Plan

Warnings duerfen spaeter aus vorhandenen `statusResult.errors` oder Widerspruechen entstehen.

Notes sollen statisch und kurz sein:

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

## No-Mutation-Grenzen in der spaeteren Funktion

Die spaetere Funktion darf nicht:

```text
statusResult veraendern
state veraendern
Dateien schreiben
DB lesen/schreiben
Fetches ausfuehren
Timer starten
EventBus emitten
OBS/Streamer.bot aufrufen
Queue/Sound/Alert/Overlay beruehren
Recovery vorbereiten
Recovery ausfuehren
```

## Spaetere Einbindung

In CAN-22.3 nicht freigegeben.

Moegliche spaetere Einbindung erst nach separater Freigabe:

```text
nur intern ungenutzt
oder
in buildStatus() als safetyArchitectureShape anhaengen
```

Aktuelle Entscheidung:

```text
zunaechst nur intern ungenutzt planen
```

## Spaetere Tests bei echter Umsetzung

Wenn spaeter Code freigegeben wird:

```bat
node -c backend\modules\bus_diagnostics.js
```

Falls doch weitere Dateien betroffen sind:

```bat
node -c backend\modules\communication_bus.js
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Runtime-Pruefung spaeter:

```text
bestehende /api/bus-diagnostics/status Route weiter OK
bestehende /api/bus-diagnostics/recovery-preflight Route weiter OK
keine neue POST Route
keine Prepare/Execute Route
readOnly bleibt true
canPrepare bleibt false
canExecute bleibt false
```

## Offene Entscheidung nach CAN-22.3

Naechster Schritt soll klaeren:

```text
ob der no-code Plan ausreichend ist, um danach einen echten Code-Step vorzubereiten
oder ob noch eine detaillierte Test-/Rollback-Planung erforderlich ist
```

Empfohlener naechster Schritt:

```text
CAN-22.4 - Safety Architecture Backend Shape Test and Rollback Plan no-code
```

## Ergebnis CAN-22.3

CAN-22.3 definiert:

```text
primaere Zieldatei
moegliche Position in der Datei
Funktionsname
Eingabe
Ausgabe
harte Default-Werte
Overall/Module/HardBlocker/Warnings/Notes Plan
No-Mutation-Grenzen
spaetere Einbindung
spaetere Tests
naechste offene Entscheidung
```
