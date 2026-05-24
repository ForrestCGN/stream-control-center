# CURRENT_STATUS

## STEP278X

Alert Overlay Delivery Watchdog ergänzt.

Geändert:

- `backend/modules/alert_system.js`
- `backend/modules/communication_bus.js`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

Neu:

- `project-state/STEP278X_ALERT_OVERLAY_DELIVERY_WATCHDOG.md`

Funktionen:

- Neue Diagnose-Routen `/api/alerts/overlay-watchdog/status`, `/check`, `/reset?confirm=1`.
- Erkennung von fehlendem echten Alert-Overlay beim Play-Signal.
- Erkennung von fehlender Overlay-Finish-/ACK-Bestätigung nach Alert-Dauer + Grace-Zeit.
- ACK-/Finish-Latenz wird im Status sichtbar.
- Keine Funktionsänderung an Sound/TTS/Queue/Overlay.
- Kein neues Modul.

## Vorheriger Stand

STEP278W: Alert Timing Diagnostics.
