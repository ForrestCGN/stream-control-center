# FILES - stream-control-center

Stand: 2026-05-09

## Loyalty / Twitch Presence relevante Dateien

Backend:

```text
backend/modules/loyalty.js
backend/modules/twitch_presence.js
backend/core/database.js
backend/modules/helpers/helper_core.js
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_routes.js
```

Config/Fallback:

```text
config/loyalty.json
```

Doku:

```text
project-state/STEP203_2_TWITCH_PRESENCE_ACTIVITY_COLLECTOR_2026-05-09.md
```

DB-Strukturen:

```text
loyalty_users
loyalty_transactions
loyalty_reservations
loyalty_imports
loyalty_ignored_users
loyalty_settings
loyalty_watch_state
twitch_presence_activity
module_text_variants mit module_name = loyalty
```

## Nie committen

```text
.env
Secrets
Tokens
SQLite-/DB-Dateien
Backups
ZIP/7z-Dateien
temporäre Dateien
_tmp*
_backup*
```
