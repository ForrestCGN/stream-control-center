# CHANGELOG

## STEP278S

- Updated `backend/modules/communication_bus.js` to `v0.7.0`.
- Added `/api/communication/test-alert` as controlled Alert Mirror Test route.
- Alert Mirror Test emits `visual.alert.play` over the Communication Bus.
- Alert Mirror Test does not touch `/api/alerts/*`, alert queue, alert DB, sound system or TTS system.
- Updated `htdocs/public/tools/communication_debug_view.html` to `v0.1.2`.
- Added `Alert Mirror Test` button to the Communication Debug View.
- Removed STEP/build metadata from new/updated module API responses and logs.
- No production migration, OBS change, dashboard auth change or `broadcastWS` replacement.

## STEP278R

- Updated `htdocs/public/tools/communication_debug_view.html` to `v0.1.1`.
- Removed visible STEP/build display from Communication Debug View.
- Debug View now shows module versions without `/ STEP...` suffix.
- Debug View strips build/step fields from visible JSON/log/detail output.
- Added `docs/backend/MODULE_VERSIONING_DISPLAY_STANDARD.md`.
- Established project rule: STEPs are documentation/project-history only; modules, tools, APIs and UIs display versions only.
