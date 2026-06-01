# STEP278 Block 27 – OBS/Overlay/Stream-Status MODULE_META

## Ziel

Loader-sichtbare Metadaten fuer OBS-, Overlay- und Stream-Status-Module vereinheitlichen.

## Geaenderte Dateien

- backend/modules/obs.js
- backend/modules/scene_control.js
- backend/modules/overlay_data.js
- backend/modules/start_overlay.js
- backend/modules/stream_status.js
- backend/modules/twitch_chat_overlay.js

## Aenderungen

- `MODULE_META` ergaenzt bzw. exportiert
- `MODULE_VERSION`/`version` exportiert
- `type: "runtime"` gesetzt
- Kategorie und Routenpraefix ergaenzt

## Nicht geaendert

- Keine OBS-Logik
- Keine WebSocket-/IRC-Logik
- Keine Overlay-Logik
- Keine Routen-Aenderung
- Keine DB-Migration
- Kein Heartbeat-/Bus-Umbau
- Kein Loader-Umbau

## Erwartung in `/api/_status`

Diese Module sollen nach Deploy/Neustart nicht mehr `version=unknown`/`hasModuleMeta=false`/`type=unknown` zeigen:

- obs.js
- scene_control.js
- overlay_data.js
- start_overlay.js
- stream_status.js
- twitch_chat_overlay.js
