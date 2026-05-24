# Files – aktueller relevanter Stand

## Backend

- `backend/modules/alert_system.js`  
  Enthält nativen Alert Visual Output Mode, Timing Cleanup, Bus Mirror, Watchdog und Recovery Controls.

- `backend/modules/sound_system.js`  
  STEP289/STEP289B: enthält additiven Sound-Bus-Event-Ausgang, sichtbaren Top-Level-Status `soundBus` in `/api/sound/status` und weiterhin den bestehenden alten WebSocket-/REST-Sound-System-Stand.

- `backend/modules/communication_bus.js`  
  Communication Bus Helper/API, Version `0.8.1`.

## Config

- `config/sound_system.json`  
  Enthält den `soundBus`-Block. Sicherer Default bleibt `enabled = false`, Aktivierung für Tests über `/api/sound/settings` möglich.

## Overlays / Tools

- `htdocs/overlays/_overlay-alerts-v2-bus.html`  
  Alert Bus Bridge, Version `0.1.1`.

- `htdocs/public/tools/communication_debug_view.html`  
  Communication Debug View, Version `0.1.9`, inkl. Snapshot, Normalbetrieb-Check und Bridge-Erkennung.

## Dokumentation

- `docs/backend/SOUND_SYSTEM_BUS_AUDIT_STEP288.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/STEP288_SOUND_SYSTEM_BUS_AUDIT.md`
- `project-state/STEP289_SOUND_SYSTEM_BUS_EVENT_OUTPUT.md`
- `project-state/STEP289B_SOUNDBUS_STATUS_EXPOSURE_FIX.md`
- `project-state/STEP290_SOUNDBUS_BASE_TESTS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## STEP290 – Test-/Doku-Stand

Keine Code-Datei wurde geändert. STEP290 dokumentiert nur die live bestätigten SoundBus-Basistests.
