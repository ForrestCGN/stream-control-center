# FILES

## CAN13.3 Planungs-ZIP

Enthaltene Dateien:

- `docs/system-inspection/EVENTBUS_CAN13_3_MANUAL_RECOVERY_CONFIRM_CONCEPT.md`
- `docs/current/CURRENT_CHAT_HANDOFF_CAN13_3.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Bezug zu CAN13.0 / CAN13.1 / CAN13.2

CAN-13.3 baut auf folgenden vorherigen Dokumenten auf:

- `docs/system-inspection/EVENTBUS_CAN13_0_NEXT_RECOVERY_CANDIDATE_PLANNING.md`
- `docs/system-inspection/EVENTBUS_CAN13_1_MANUAL_RECOVERY_AUDIT_CONCEPT.md`
- `docs/system-inspection/EVENTBUS_CAN13_2_MANUAL_RECOVERY_ROLES_RIGHTS_CONCEPT.md`

Diese Dateien sind nicht erneut in diesem ZIP enthalten, wenn sie bereits mit CAN-13.0, CAN-13.1 und CAN-13.2 eingespielt wurden.

## Zweck

CAN-13.3 ist ein reiner Doku-/Planungsstand.

Enthalten sind keine Code-Dateien und keine produktiven Recovery-Mechaniken.

## Wichtige technische Dateien aus vorherigen Steps, aber nicht in diesem ZIP enthalten

- `backend/modules/bus_diagnostics.js`
- `htdocs/dashboard/modules/bus_diagnostics.js`
- `backend/modules/communication_bus.js`

## Weiterhin nicht enthalten

- keine POST-Route
- keine Command-Route
- keine Prepare-Route
- keine Execute-Route
- keine Recovery-Buttons
- keine Simulation-Buttons mit produktiver Wirkung
- keine Queue-/Sound-/Alert-/Overlay-Mutation
- keine DB-/Config-Schreibzugriffe
- keine DB-Migration
- keine Audit-Schreibroute
- keine Rechte-API
- keine Rollen-DB-Migration
- keine produktive Rechtepruefung im Code
- keine Confirm-API
- keine Confirm-DB-Migration
- keine produktiven Confirm-Dialoge
