# FILES Ergaenzung – STEP201.5 VIP Diagnose-Endpunkte

Stand: 2026-05-08

## VIP relevante Dateien

Backend:

```text
backend/modules/vip_sound_overlay.js
```

Dashboard unveraendert:

```text
htdocs/dashboard/modules/vip.js
htdocs/dashboard/modules/vip.css
```

Overlays unveraendert:

```text
htdocs/overlays/vip_sound_overlay.html
htdocs/overlays/vip_sound_overlay_v2.html
```

Config/Fallback:

```text
config/vip_sound_roles.json
config/vip_sound.json optionaler Fallback, DB ist Hauptquelle
```

## VIP DB-Strukturen

```text
vip_sound_daily_usage
vip_sound_message_templates
vip_sound_settings
vip_sound_events
vip_sound_role_overrides
vip_sound_twitch_users
```

## VIP Standard-Diagnose

```text
GET  /api/vip-sound/routes
GET  /api/vip-sound-overlay/routes
GET  /api/vip-sound/integration-check
GET  /api/vip-sound-overlay/integration-check
POST /api/vip-sound/reload
POST /api/vip-sound-overlay/reload
```
