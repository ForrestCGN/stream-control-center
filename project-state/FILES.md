# FILES – CAN-8.8 Recovery-Preflight Check-Matrix Statusfelder Plan

Stand: 2026-06-01

## Dieses ZIP

- `docs/system-inspection/EVENTBUS_CAN8_8_RECOVERY_PREFLIGHT_CHECK_MATRIX_STATUS_FIELDS_PLAN.md`
  - Plan fuer CAN-8.9 Backend-Minimalchecks.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN8_8.md`
  - Uebergabe fuer den naechsten Schritt.
- `docs/current/README_CAN8_8_FILE_ZIP.md`
  - Entpack-/Abschluss-Hinweise.
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Fuer CAN-8.9 relevant

- `backend/modules/bus_diagnostics.js`
  - Darf in CAN-8.9 additiv erweitert werden.
  - Nur read-only Statusfelder.
  - Keine neue Route.
  - Keine produktive Flow-Beruehrung.

## Nicht anfassen ohne separates Go

- `htdocs/dashboard/modules/bus_diagnostics.js`
- `backend/modules/communication_bus.js`
- `backend/modules/alert_system.js`
- `backend/modules/sound_system.js`
- `config/*`
- Datenbank-Dateien
