# FILES – STEP278 Vorbereitung

## Direkt relevant für heutigen Test

- `config/clip_system.json`
  - enthält `clipShoutout`
  - enthält jetzt `clipShoutout.officialShoutout.liveGateEnabled = false`

## Für STEP278 prüfen

### Backend

- `backend/server.js`
- `backend/modules/alert_system.js`
- `backend/modules/sound_system.js`
- `backend/modules/clip_shoutout.js`
- `backend/modules/twitch.js`
- `backend/modules/twitch_presence.js`

### Overlays

- `htdocs/overlays/_overlay-alerts-v2.html`
- `htdocs/overlays/sound_system_overlay.html`

### Configs

- `config/alert_system.json`
- `config/sound_system.json`
- `config/clip_system.json`

### Helper, falls vorhanden

- `backend/modules/helpers/helper_state.js`
- `backend/modules/helpers/helper_routes.js`
- `backend/modules/helpers/helper_core.js`
- `backend/modules/helpers/helper_config.js`
