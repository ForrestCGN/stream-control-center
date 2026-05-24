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
  Enthält den `soundBus`-Block. Sicherer Default bleibt konfigurierbar; Aktivierung für Tests über `/api/sound/settings` möglich.

## Tests / Traces

- `_trace/live_sound_trace_20260524_160117.summary.txt`  
  STEP291 Live-Trace-Zusammenfassung des V5 Real Queue/Bundle Tests.

- `_trace/live_sound_trace_20260524_160117.jsonl`  
  STEP291 Live-Trace-Rohdaten.

- `_trace/sound_queue_full_order_v5_real_mod_20260524_160117.events.json`  
  STEP291 Event-/Response-Datei des V5 Real Queue/Bundle Tests.

## Overlays / Tools

- `htdocs/overlays/_overlay-alerts-v2-bus.html`  
  Alert Bus Bridge, Version `0.1.1`.

- `htdocs/public/tools/communication_debug_view.html`  
  Communication Debug View, Version `0.1.9`, inkl. Snapshot, Normalbetrieb-Check und Bridge-Erkennung.

## Dokumentation

- `docs/backend/SOUND_SYSTEM_BUS_AUDIT_STEP288.md`
- `docs/backend/SOUNDBUS_BASE_TESTS_STEP290.md`
- `docs/backend/SOUNDBUS_V5_REGRESSION_STEP291.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/STEP288_SOUND_SYSTEM_BUS_AUDIT.md`
- `project-state/STEP289_SOUND_SYSTEM_BUS_EVENT_OUTPUT.md`
- `project-state/STEP289B_SOUNDBUS_STATUS_EXPOSURE_FIX.md`
- `project-state/STEP290_SOUNDBUS_BASE_TESTS.md`
- `project-state/STEP291_SOUNDBUS_V5_REGRESSION_TEST.md`
