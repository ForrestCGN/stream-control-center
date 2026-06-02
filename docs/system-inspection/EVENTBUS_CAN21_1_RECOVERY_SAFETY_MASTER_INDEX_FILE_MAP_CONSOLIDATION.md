# EVENTBUS CAN-21.1 - Recovery Safety Master Index / File Map Consolidation

## Projekt

ForrestCGN `stream-control-center`

## Stand

CAN-21.1

## Zweck

CAN-21.1 erstellt eine strukturierte Datei-Landkarte fuer den Recovery-/Safety-Planungsstrang von CAN-13 bis CAN-21.

Wichtig:

```text
Dies ist nur Dokumentation/Konsolidierung.
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

CAN-21.0 hat die Recovery Safety Master Documentation Consolidation erstellt.

CAN-21.1 ergaenzt dazu eine Datei-Landkarte, damit spaeter klar ist:

```text
welche Dokumente zu welchem CAN-Schritt gehoeren
welche Handoff-Dateien Einstiegspunkte sind
welche Projektstatusdateien aktualisiert wurden
welche technischen Dateien bewusst unveraendert blieben
welche Datei im naechsten Chat zuerst gelesen werden soll
```

## Harte Grenze fuer CAN-21.1

CAN-21.1 darf nicht enthalten:

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

## Einstiegspunkt fuer neue Chats

Aktueller Einstiegspunkt nach CAN-21.1:

```text
docs/current/CURRENT_CHAT_HANDOFF_CAN21_1.md
```

Fallback/Einstieg fuer Master-Zusammenfassung:

```text
docs/system-inspection/EVENTBUS_CAN21_0_RECOVERY_SAFETY_MASTER_DOCUMENTATION_CONSOLIDATION.md
```

## CAN-13 Datei-Gruppe

Thema:

```text
Recovery Safety Planning
```

Wichtige Dokumente:

```text
docs/system-inspection/EVENTBUS_CAN13_0_NEXT_RECOVERY_CANDIDATE_PLANNING.md
docs/system-inspection/EVENTBUS_CAN13_1_AUDIT_CONCEPT.md
docs/system-inspection/EVENTBUS_CAN13_2_ROLES_RIGHTS_CONCEPT.md
docs/system-inspection/EVENTBUS_CAN13_3_CONFIRM_CONCEPT.md
docs/system-inspection/EVENTBUS_CAN13_4_SAFETYSTOP_CANCEL_CONCEPT.md
docs/system-inspection/EVENTBUS_CAN13_5_RECOVERY_CANDIDATE_MATRIX.md
docs/system-inspection/EVENTBUS_CAN13_6_RECOVERY_SAFETY_PLANNING_CLOSURE.md
```

Handoff:

```text
docs/current/CURRENT_CHAT_HANDOFF_CAN13_0.md
```

## CAN-14 Datei-Gruppe

Thema:

```text
Safety Status View read-only
```

Wichtige Dokumente:

```text
docs/system-inspection/EVENTBUS_CAN14_0_READONLY_SAFETY_STATUS_VIEW_PLANNING.md
docs/system-inspection/EVENTBUS_CAN14_1_SAFETY_STATUS_CONTRACT_READONLY.md
docs/system-inspection/EVENTBUS_CAN14_2_BACKEND_STATUS_SHAPE_READONLY_PLANNING.md
docs/system-inspection/EVENTBUS_CAN14_3_DASHBOARD_SAFETY_STATUS_VIEW_PLANNING.md
docs/system-inspection/EVENTBUS_CAN14_5_LIVETEST_READONLY_PENDING.md
docs/system-inspection/EVENTBUS_CAN14_6_SAFETY_STATUS_VIEW_READONLY_CLOSURE.md
```

Technisch geaendert in CAN-14.4/CAN-14.5.1:

```text
htdocs/dashboard/modules/bus_diagnostics.js
```

Wichtig:

```text
CAN-14 war read-only Dashboard-Anzeige.
Keine produktive Recovery.
Keine POST-/Prepare-/Execute-Route.
```

## CAN-15 Datei-Gruppe

Thema:

```text
Audit Planning no-write/no-data
```

Wichtige Dokumente:

```text
docs/system-inspection/EVENTBUS_CAN15_0_RECOVERY_SAFETY_DOCUMENTATION_CONSOLIDATION.md
docs/system-inspection/EVENTBUS_CAN15_1_RECOVERY_SAFETY_NEXT_CANDIDATE_DECISION.md
docs/system-inspection/EVENTBUS_CAN15_2_AUDIT_BOUNDARY_NOWRITE_PLANNING.md
docs/system-inspection/EVENTBUS_CAN15_3_AUDIT_EVENT_CATALOG_NOWRITE_PLANNING.md
docs/system-inspection/EVENTBUS_CAN15_4_AUDIT_DATA_MINIMIZATION_POLICY_NOWRITE_PLANNING.md
docs/system-inspection/EVENTBUS_CAN15_5_AUDIT_DISPLAY_READONLY_NODATA_PLANNING.md
docs/system-inspection/EVENTBUS_CAN15_6_AUDIT_PLANNING_CLOSURE_HANDOFF.md
```

## CAN-16 Datei-Gruppe

Thema:

```text
SafetyStop Planning read-only/no-api
```

Wichtige Dokumente:

```text
docs/system-inspection/EVENTBUS_CAN16_0_SAFETYSTOP_STATUS_CONCEPT_READONLY_NOAPI_PLANNING.md
docs/system-inspection/EVENTBUS_CAN16_1_SAFETYSTOP_STATE_MATRIX_READONLY_NOAPI_PLANNING.md
docs/system-inspection/EVENTBUS_CAN16_2_SAFETYSTOP_DISPLAY_CONTRACT_READONLY_NOAPI_PLANNING.md
docs/system-inspection/EVENTBUS_CAN16_3_SAFETYSTOP_INTEGRATION_BOUNDARY_READONLY_NOAPI_PLANNING.md
docs/system-inspection/EVENTBUS_CAN16_4_SAFETYSTOP_PLANNING_CLOSURE_HANDOFF.md
```

Finaler Handoff:

```text
docs/current/CURRENT_CHAT_HANDOFF_CAN16_4_FINAL.md
```

## CAN-17 Datei-Gruppe

Thema:

```text
Roles/Rights Planning no-mutation/no-implementation
```

Wichtige Dokumente:

```text
docs/system-inspection/EVENTBUS_CAN17_0_ROLES_RIGHTS_BOUNDARY_NOMUTATION_PLANNING.md
docs/system-inspection/EVENTBUS_CAN17_1_ROLES_RIGHTS_ACTION_MATRIX_NOMUTATION_PLANNING.md
docs/system-inspection/EVENTBUS_CAN17_2_ROLES_RIGHTS_BACKEND_BOUNDARY_NOIMPLEMENTATION_PLANNING.md
docs/system-inspection/EVENTBUS_CAN17_3_ROLES_RIGHTS_DISPLAY_BOUNDARY_NOIMPLEMENTATION_PLANNING.md
docs/system-inspection/EVENTBUS_CAN17_4_ROLES_RIGHTS_PLANNING_CLOSURE_HANDOFF.md
```

Finaler Handoff:

```text
docs/current/CURRENT_CHAT_HANDOFF_CAN17_4_FINAL.md
```

## CAN-18 Datei-Gruppe

Thema:

```text
Confirm Planning no-action/no-implementation
```

Wichtige Dokumente:

```text
docs/system-inspection/EVENTBUS_CAN18_0_CONFIRM_BOUNDARY_NOACTION_PLANNING.md
docs/system-inspection/EVENTBUS_CAN18_1_CONFIRM_ACTION_MATRIX_NOACTION_PLANNING.md
docs/system-inspection/EVENTBUS_CAN18_2_CONFIRM_DISPLAY_BOUNDARY_NOACTION_PLANNING.md
docs/system-inspection/EVENTBUS_CAN18_3_CONFIRM_PLANNING_CLOSURE_HANDOFF.md
```

Finaler Handoff:

```text
docs/current/CURRENT_CHAT_HANDOFF_CAN18_3_FINAL.md
```

## CAN-19 Datei-Gruppe

Thema:

```text
Recovery Safety Architecture Planning / Consolidation
```

Wichtige Dokumente:

```text
docs/system-inspection/EVENTBUS_CAN19_0_RECOVERY_SAFETY_ARCHITECTURE_CONSOLIDATION.md
docs/system-inspection/EVENTBUS_CAN19_1_SAFETY_ARCHITECTURE_STATUS_DISPLAY_READONLY_NOAPI_PLANNING.md
docs/system-inspection/EVENTBUS_CAN19_2_SAFETY_ARCHITECTURE_IMPLEMENTATION_READINESS_MATRIX_PLANNING.md
docs/system-inspection/EVENTBUS_CAN19_3_SAFETY_ARCHITECTURE_CONTRACTS_CONSOLIDATION_PLANNING.md
docs/system-inspection/EVENTBUS_CAN19_4_SAFETY_ARCHITECTURE_PLANNING_CLOSURE_HANDOFF.md
```

Finaler Handoff:

```text
docs/current/CURRENT_CHAT_HANDOFF_CAN19_4_FINAL.md
```

## CAN-20 Datei-Gruppe

Thema:

```text
Safety Architecture Backend Shape Planning read-only/no-route/no-code
```

Wichtige Dokumente:

```text
docs/system-inspection/EVENTBUS_CAN20_0_SAFETY_ARCHITECTURE_BACKEND_SHAPE_READONLY_NOROUTE_PLANNING.md
docs/system-inspection/EVENTBUS_CAN20_1_SAFETY_ARCHITECTURE_BACKEND_SHAPE_VALIDATION_PLANNING.md
docs/system-inspection/EVENTBUS_CAN20_2_SAFETY_ARCHITECTURE_BACKEND_SHAPE_PLANNING_CLOSURE_HANDOFF.md
```

Finaler Handoff:

```text
docs/current/CURRENT_CHAT_HANDOFF_CAN20_2_FINAL.md
```

## CAN-21 Datei-Gruppe

Thema:

```text
Recovery Safety Master Documentation
```

Wichtige Dokumente:

```text
docs/system-inspection/EVENTBUS_CAN21_0_RECOVERY_SAFETY_MASTER_DOCUMENTATION_CONSOLIDATION.md
docs/system-inspection/EVENTBUS_CAN21_1_RECOVERY_SAFETY_MASTER_INDEX_FILE_MAP_CONSOLIDATION.md
```

Aktueller Handoff:

```text
docs/current/CURRENT_CHAT_HANDOFF_CAN21_1.md
```

## Projektstatusdateien

Diese Dateien werden in den STEP-/CAN-ZIPs mitgefuehrt:

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Technische Dateien, die bewusst unveraendert bleiben

```text
backend/modules/bus_diagnostics.js
backend/modules/communication_bus.js
htdocs/dashboard/modules/bus_diagnostics.js
```

Ausnahme:

```text
CAN-14.4/CAN-14.5.1 hatte htdocs/dashboard/modules/bus_diagnostics.js fuer die read-only Safety Status View angepasst.
```

## Aktueller technischer Sicherheitsstand

```text
readOnly: true
canPrepare: false
canExecute: false
commandRoute: false
prepareRoute: false
executeRoute: false
recoveryExecution: false
dashboardRecoveryButtons: false
safetyStatusApi: false
backendSafetyStatusShapeImplemented: false
```

## Weiterhin hart blockiert

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

## Naechster sinnvoller Schritt

```text
CAN-21.2 - Recovery Safety Master Closure / Next Technical Candidate Decision
```

Ziel:

```text
Den Master-Doku-Strang abschliessen und entscheiden, ob der naechste Schritt weiterhin Planung bleibt oder ob eine echte read-only technische Umsetzung vorbereitet werden soll.
```
