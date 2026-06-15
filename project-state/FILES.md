# FILES – stream-control-center

Stand: 2026-06-15

## Relevante Dateien für aktuellen Loyalty-Stand

### Backend

```text
backend/modules/loyalty.js
backend/modules/twitch.js
backend/modules/twitch_events.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
```

### Dashboard

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
htdocs/dashboard/modules/loyalty_games.js
```

### Doku / Projektstand

```text
docs/current/CURRENT_CHAT_HANDOFF_LC_DASHBOARD_TEXTS_4_GO_LIVE_POINTS_IMPORT_2026-06-15.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/modules/loyalty.md
```

## Wichtige Routen

### Loyalty Core

```text
GET  /api/loyalty/status
GET  /api/loyalty/settings
POST /api/loyalty/settings
GET  /api/loyalty/events/history
GET  /api/loyalty/events/history/:eventUid
```

### Texte

```text
GET/POST /api/loyalty/giveaways/texts
GET/POST /api/loyalty/games/texts
```

### Twitch Events / Status

```text
GET /api/twitch/eventsub/status
GET /api/twitch/events/status
GET /api/twitch/events/stream-state
GET /api/alerts/twitch-events/status
```

## Letzte relevante ZIP-Arbeitsstände

```text
LC_CORE_GIFTS_CONFIG_1_receiver_mode_v0.1.23.zip
LC_DASHBOARD_CONFIG_4_gift_receiver_write.zip
LC_DASHBOARD_CONFIG_5_raid_settings_write.zip
LC_DASHBOARD_CONFIG_6_core_auto_points_write.zip
LC_DASHBOARD_CONFIG_6B_settings_reload_fix.zip
LC_DASHBOARD_CONFIG_7_subscriber_auto_points.zip
LC_DASHBOARD_LOGS_2_compact_details_modal.zip
LC_DASHBOARD_TEXTS_4_multi_module_text_api.zip
```
