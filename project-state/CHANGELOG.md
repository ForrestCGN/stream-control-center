# CHANGELOG

## STEP278R

- Updated `htdocs/public/tools/communication_debug_view.html` to `v0.1.1`.
- Removed visible STEP/build display from Communication Debug View.
- Debug View now shows module versions without `/ STEP...` suffix.
- Debug View strips build/step fields from visible JSON/log/detail output.
- Added `docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md`.
- Established project rule: STEPs are documentation/project-history only; modules, tools, APIs and UIs display versions only.
- No backend API fields were removed for compatibility.
- No alert, sound, TTS, VIP, dashboard, database, OBS or `broadcastWS` migration changes.

## STEP278Q

- Added `htdocs/public/tools/communication_debug_view.html`.
- Debug View displays Communication Bus status, clients, events, watchdog diagnosis, recovered events and historical issues.
- Debug View provides buttons for refresh, watchdog checks, recovery checks, replay and reset.
- No backend-code or production-migration changes.
