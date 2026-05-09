# FILES - stream-control-center

Stand: 2026-05-09

## Loyalty relevante Dateien

Backend:

```text
backend/modules/loyalty.js
backend/core/database.js
backend/modules/helpers/helper_core.js
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_texts.js
```

Config/Fallback:

```text
config/loyalty.json
```

Doku:

```text
project-state/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md
project-state/STEP202_LOYALTY_CAPTURE_AND_MIGRATION_PREP_2026-05-09.md
project-state/STEP202_1_LOYALTY_DB_FIRST_STANDARD_2026-05-09.md
project-state/STEP202_2_LOYALTY_SHADOW_MODE_AND_BONUS_RULES_2026-05-09.md
project-state/STEP203_LOYALTY_CORE_DB_API_SHADOW_MODE_2026-05-09.md
project-state/STEP203_1_LOYALTY_WATCH_SHADOW_HOOK_2026-05-09.md
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
module_text_variants mit module_name = loyalty
```

Aktuelle Loyalty-Version:

```text
0.1.1
```

## Weiterhin geplant

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
backend/modules/loyalty_rewards.js
backend/modules/giveaways.js
backend/modules/loyalty_games.js
htdocs/overlays/loyalty-games-overlay.html
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
