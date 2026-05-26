# FILES

Stand: 2026-05-26

## Aktuell relevante Dateien – Kanalpunkte-System

### Backend

```text
backend/modules/channelpoints.js
backend/modules/channelpoints_eventsub_bus_bridge.js
backend/modules/channelpoints_twitch_readonly_sync.js
backend/modules/twitch.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_communication.js
backend/core/database.js
```

### Dashboard

```text
htdocs/dashboard/modules/channelpoints.js
htdocs/dashboard/modules/channelpoints.css
```

### Dokumentation

```text
docs/modules/channelpoints.md
docs/modules/channelpoints-deep-dive.md
docs/modules/channelpoints_eventbus_redemption_bridge.md
docs/modules/channelpoints_redemption_store_update_bind_fix.md
docs/modules/channelpoints_twitch_delete_and_create_params.md
docs/modules/channelpoints_twitch_advanced_fields_ui.md
docs/modules/channelpoints_redemption_completion_policy.md
docs/modules/channelpoints_color_picker_presets.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md
docs/handoff/NEXT_CHAT_HANDOFF.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/GENERAL_PROJECT_PROMPT.md
```

## Letzte relevante ZIPs

```text
STEP508_CHANNELPOINTS_OPERATION_CLEANUP_CONSOLIDATED_v1.0.0.zip
STEP509_CHANNELPOINTS_TWITCH_REWARD_WRITE_FOUNDATION_SIMPLE_v0.8.9.zip
STEP510_CHANNELPOINTS_TWITCH_PUSH_STALE_ID_CREATE_FALLBACK_v0.9.0.zip
STEP511_CHANNELPOINTS_EVENTBUS_REDEMPTION_BRIDGE_v0.9.1.zip
STEP512_CHANNELPOINTS_REDEMPTION_STORE_UPDATE_BIND_FIX_v0.9.2.zip
STEP513_CHANNELPOINTS_TWITCH_DELETE_AND_CREATE_PARAMS_v0.9.3.zip
STEP514_CHANNELPOINTS_TWITCH_ADVANCED_FIELDS_UI_v1.0.1.zip
STEP515_CHANNELPOINTS_REDEMPTION_COMPLETION_POLICY_v0.9.4.zip
STEP516_CHANNELPOINTS_COLOR_PICKER_PRESETS_v1.0.3.zip
```

## Live-/Repo-Pfade

```text
Repo: D:\Git\stream-control-center
Live: D:\Streaming\stramAssets
SQLite: D:\Streaming\stramAssets\data\sqlitepp.sqlite
```

## Wichtige Runtime-/DB-Hinweise

- `app.sqlite` niemals ersetzen oder überschreiben.
- Redemptions werden in bestehender Tabelle `channelpoints_redemptions` gespeichert.
- Reward-Konfigurationen nutzen bestehende Kanalpunkte-Tabellen/Felder.
- Twitch-Farben werden als Hex `#RRGGBB` gespeichert.
- Erweiterte Twitch-Optionen liegen teilweise in `action_payload_json.twitch`.
