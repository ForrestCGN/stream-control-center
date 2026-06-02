# EVENTBUS CAN-20.0 - Safety Architecture Backend Shape read-only/no-route Planning

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-20.0

## Zweck

CAN-20.0 plant, wie ein spaeteres internes Backend-Objekt fuer die Safety Architecture aussehen koennte.

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

CAN-19.4 wurde abgeschlossen als:

```text
Recovery Safety Architecture Planning / Consolidation
```

Empfohlener naechster Schritt:

```text
CAN-20.0 - Safety Architecture Backend Shape read-only/no-route Planning
```

## Harte Grenze fuer CAN-20.0

CAN-20.0 darf nicht enthalten:

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

## Ziel des Backend-Shapes

Ein spaeteres internes Backend-Shape soll read-only zusammenfassen koennen:

```text
Gesamtstatus der Safety Architecture
Audit Status
SafetyStop Status
Roles/Rights Status
Confirm Status
Recovery Execution Status
Hard Blocker
Technical Boundaries
Warnings/Notes
```

CAN-20.0 baut dieses Shape nicht. Es beschreibt nur die Struktur.

## Root Shape

Nur Planung:

```json
{
  "ok": true,
  "module": "bus_diagnostics",
  "contract": "safety_architecture_backend_shape_readonly",
  "contractVersion": "CAN-20.0",
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

## Root Pflichtfelder

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

## Root Feldregeln

### ok

```text
true = Shape konnte intern read-only aufgebaut werden
false = Shape konnte nicht sauber aufgebaut werden
```

### readOnly

Muss bleiben:

```text
true
```

### hasRoute

Muss fuer CAN-20.0 bleiben:

```text
false
```

### hasApi

Muss fuer CAN-20.0 bleiben:

```text
false
```

### hasMutation

Muss bleiben:

```text
false
```

## Overall Shape

Nur Planung:

```json
{
  "level": "planned",
  "label": "Sicherheitsarchitektur geplant",
  "message": "Audit, SafetyStop, Roles/Rights und Confirm sind geplant, aber nicht technisch aktiv.",
  "architectureConsolidated": true,
  "allHighRiskBlocked": true,
  "canPrepare": false,
  "canExecute": false,
  "recoveryExecution": false
}
```

## Module Shape

Geplante Module:

```text
audit
safetyStop
rolesRights
confirm
recoveryExecution
```

Gemeinsames Modul-Shape:

```json
{
  "id": "audit",
  "label": "Audit",
  "level": "planned",
  "status": "planned_only",
  "readOnly": true,
  "implemented": false,
  "planningComplete": true,
  "hasApi": false,
  "hasRoute": false,
  "hasDb": false,
  "hasMutation": false,
  "missingPrerequisites": [],
  "blockedActions": [],
  "notes": []
}
```

## Audit Shape

Nur Planung:

```json
{
  "id": "audit",
  "label": "Audit",
  "level": "planned",
  "status": "planned_only",
  "readOnly": true,
  "implemented": false,
  "planningComplete": true,
  "hasApi": false,
  "hasRoute": false,
  "hasDb": false,
  "hasMutation": false,
  "missingPrerequisites": [
    "audit_storage",
    "retention_config",
    "masking_sanitizing",
    "rights_check",
    "read_api",
    "dashboard_display"
  ],
  "blockedActions": [
    "audit_write",
    "audit_read_api",
    "audit_export",
    "audit_delete"
  ],
  "notes": [
    "planned_not_implemented",
    "no_write"
  ]
}
```

## SafetyStop Shape

Nur Planung:

```json
{
  "id": "safetyStop",
  "label": "SafetyStop",
  "level": "planned",
  "status": "planned_only",
  "readOnly": true,
  "implemented": false,
  "planningComplete": true,
  "hasApi": false,
  "hasRoute": false,
  "hasDb": false,
  "hasMutation": false,
  "missingPrerequisites": [
    "runtime_state_source",
    "set_clear_rules",
    "rights_check",
    "audit_coupling",
    "confirm_coupling",
    "dashboard_display"
  ],
  "blockedActions": [
    "safetystop_set",
    "safetystop_clear",
    "safetystop_reset"
  ],
  "notes": [
    "planned_not_implemented",
    "clear_blocked"
  ]
}
```

## Roles/Rights Shape

Nur Planung:

```json
{
  "id": "rolesRights",
  "label": "Roles/Rights",
  "level": "planned",
  "status": "planned_only",
  "readOnly": true,
  "implemented": false,
  "planningComplete": true,
  "hasApi": false,
  "hasRoute": false,
  "hasDb": false,
  "hasMiddleware": false,
  "hasMutation": false,
  "missingPrerequisites": [
    "identity_source",
    "auth_source",
    "roles_source",
    "permission_model",
    "middleware",
    "audit_coupling",
    "dashboard_display"
  ],
  "blockedActions": [
    "role_assign",
    "role_remove",
    "permission_edit",
    "rights_api"
  ],
  "notes": [
    "planned_not_implemented",
    "client_not_authority"
  ]
}
```

## Confirm Shape

Nur Planung:

```json
{
  "id": "confirm",
  "label": "Confirm",
  "level": "planned",
  "status": "planned_only",
  "readOnly": true,
  "implemented": false,
  "planningComplete": true,
  "hasApi": false,
  "hasRoute": false,
  "hasDb": false,
  "hasButton": false,
  "hasToken": false,
  "hasMutation": false,
  "missingPrerequisites": [
    "confirm_request_model",
    "token_nonce_concept",
    "ttl_runtime",
    "cancel_expire_handling",
    "audit_coupling",
    "rights_safetystop_guard_coupling",
    "dashboard_display"
  ],
  "blockedActions": [
    "confirm_api",
    "confirm_execute",
    "confirm_button",
    "confirm_token"
  ],
  "notes": [
    "planned_not_implemented",
    "confirm_is_not_execution"
  ]
}
```

## RecoveryExecution Shape

Nur Planung:

```json
{
  "id": "recoveryExecution",
  "label": "Recovery Execution",
  "level": "blocked",
  "status": "blocked",
  "readOnly": true,
  "implemented": false,
  "planningComplete": false,
  "canPrepare": false,
  "canExecute": false,
  "hasPrepareRoute": false,
  "hasExecuteRoute": false,
  "hasMutation": false,
  "blockedActions": [
    "recovery_prepare",
    "recovery_execute",
    "auto_recovery"
  ],
  "notes": [
    "execution_blocked",
    "no_prepare_route",
    "no_execute_route"
  ]
}
```

## HardBlockedActions Shape

Nur Planung:

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

## TechnicalBoundaries Shape

Nur Planung:

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
  "overlayMutation": false,
  "obsAction": false,
  "streamerbotAction": false
}
```

## Warning Shape

Nur Planung:

```json
{
  "id": "missing_data_source",
  "level": "warning",
  "message": "Safety Architecture has no technical runtime source yet."
}
```

## Notes Shape

Notes sollen kurze maschinenlesbare Hinweise sein:

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

## No-route-Regel

CAN-20.0 plant keine Route.

Nicht erstellen:

```text
GET /api/safety-architecture
GET /api/bus-diagnostics/safety-architecture
GET /api/recovery-safety/architecture
POST /api/safety-architecture
```

## No-code-Regel

CAN-20.0 erstellt keine Datei in:

```text
backend/modules/
htdocs/dashboard/modules/
config/
data/
```

## No-mock-Regel

Nicht erlaubt:

```text
Fake Audit Events
Fake SafetyStop Runtime
Fake Roles
Fake Confirm State
Fake Recovery Capability
```

## Ergebnis CAN-20.0

CAN-20.0 definiert:

```text
Root Shape
Overall Shape
Module Shape
Audit Shape
SafetyStop Shape
Roles/Rights Shape
Confirm Shape
RecoveryExecution Shape
HardBlockedActions Shape
TechnicalBoundaries Shape
Warning Shape
Notes Shape
No-route-/No-code-/No-mock-Regeln
```

## Naechster sinnvoller Schritt

```text
CAN-20.1 - Safety Architecture Backend Shape Validation Planning
```
