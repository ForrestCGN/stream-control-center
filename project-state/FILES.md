# FILES - stream-control-center

Stand: 2026-05-09

## Loyalty / Kekskrümel

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

Dokus:

```text
project-state/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md
project-state/STEP202_LOYALTY_CAPTURE_AND_MIGRATION_PREP_2026-05-09.md
project-state/STEP202_1_LOYALTY_DB_FIRST_STANDARD_2026-05-09.md
project-state/STEP202_2_LOYALTY_SHADOW_MODE_AND_BONUS_RULES_2026-05-09.md
project-state/STEP203_LOYALTY_CORE_DB_API_SHADOW_MODE_2026-05-09.md
```

DB-Strukturen ab STEP203:

```text
loyalty_users
loyalty_transactions
loyalty_reservations
loyalty_imports
loyalty_ignored_users
loyalty_settings
module_text_variants mit module_name = loyalty
```

Routen ab STEP203:

```text
GET    /api/loyalty/status
GET    /api/loyalty/config
GET    /api/loyalty/settings
POST   /api/loyalty/settings
GET    /api/loyalty/users
GET    /api/loyalty/users/:login
GET    /api/loyalty/balance/:login
GET    /api/loyalty/transactions
POST   /api/loyalty/transactions/adjust
GET    /api/loyalty/test/watch
GET    /api/loyalty/ignored-users
POST   /api/loyalty/ignored-users
DELETE /api/loyalty/ignored-users/:login
GET    /api/loyalty/routes
```

Noch geplant:

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
backend/modules/loyalty_rewards.js
backend/modules/giveaways.js
backend/modules/loyalty_games.js
```

## TTS relevante Dateien

```text
backend/modules/tts_system.js
htdocs/dashboard/modules/tts.js
htdocs/dashboard/modules/tts.css
config/tts_config.json
config/tts_messages.json
```

## SoundAlerts relevante Dateien

```text
backend/modules/soundalerts_bridge.js
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
config/soundalerts_bridge.json
htdocs/overlays/sound_system_overlay.html
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
