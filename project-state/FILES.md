# FILES – CAN-9.0 Recovery-Preflight Route Startgrenze

Stand: 2026-06-01

## Diese ZIP

- `docs/system-inspection/EVENTBUS_CAN9_0_RECOVERY_PREFLIGHT_ROUTE_START_BOUNDARY.md`
  - Startgrenze fuer spaetere read-only Preflight-Route.
- `docs/current/CURRENT_CHAT_HANDOFF_CAN9_0.md`
  - Uebergabe fuer CAN-9.0/CAN-9.1.
- `docs/current/README_CAN9_0_FILE_ZIP.md`
  - Entpack-/Stepdone-Hinweis.
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Fuer spaetere CAN-9 Code-Steps relevant

- `backend/modules/bus_diagnostics.js`
  - Muss vor jedem echten Code-Step vollstaendig geprueft werden.

## Nicht angefasst

- Keine Backend-Datei.
- Keine Dashboard-Datei.
- Keine API-Route.
- Keine Config.
- Keine DB.
