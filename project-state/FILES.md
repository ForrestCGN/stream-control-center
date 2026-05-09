# FILES - stream-control-center

Stand: 2026-05-09

## Loyalty / StreamElements Migration Dokus

Aktuelle Loyalty-Dokus:

```text
project-state/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md
project-state/STEP202_LOYALTY_CAPTURE_AND_MIGRATION_PREP_2026-05-09.md
project-state/STEP202_1_LOYALTY_DB_FIRST_STANDARD_2026-05-09.md
project-state/STEP202_2_LOYALTY_SHADOW_MODE_AND_BONUS_RULES_2026-05-09.md
```

Verbindliche Loyalty-Regeln:

```text
Alles, was Kekskrümel gibt, nimmt, prüft, reserviert, erstattet oder verändert, läuft ausschließlich über das Loyalty-System.
```

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
```

```text
Shadow Mode zuerst, StreamElements bleibt aktiv, Import später.
```

## Geplante spätere Loyalty-Dateien

Backend:

```text
backend/modules/loyalty.js
backend/modules/loyalty_rewards.js
backend/modules/giveaways.js
backend/modules/loyalty_games.js
backend/core/database.js
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_config.js
```

Dashboard:

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
htdocs/dashboard/modules/giveaways.js
htdocs/dashboard/modules/giveaways.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
```

Overlays:

```text
htdocs/overlays/loyalty-games-overlay.html
```

Config/Fallback:

```text
config/loyalty.json
config/giveaways.json
config/loyalty_games.json
```

Wichtig:

```text
Diese JSON-Dateien dürfen nur Seed/Fallback/technische Boot-Konfig enthalten.
Produktive Punktestände, Transaktionen, Userdaten, Rewards, Giveaways und Games gehören in die DB.
```

## Geplante spätere DB-Strukturen

```text
loyalty_users
loyalty_transactions
loyalty_settings
loyalty_reservations
loyalty_imports
loyalty_ignored_users
loyalty_rewards
loyalty_reward_categories
loyalty_redemptions
loyalty_reward_cooldowns
giveaways
giveaway_entries
giveaway_winners
giveaway_settings
giveaway_assets
loyalty_games
loyalty_game_settings
loyalty_game_sessions
loyalty_game_entries
loyalty_game_results
```

## TTS relevante Dateien

Backend:

```text
backend/modules/tts_system.js
backend/core/database.js
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_media.js
backend/modules/helpers/helper_core.js
backend/modules/helpers/helper_texts.js
```

Dashboard:

```text
htdocs/dashboard/modules/tts.js
htdocs/dashboard/modules/tts.css
htdocs/dashboard/index.html
```

Config/Fallback:

```text
config/tts_config.json
config/tts_messages.json
config/tts_bans.json
config/tts_state.json
```

## SoundAlerts relevante Dateien

Backend:

```text
backend/modules/soundalerts_bridge.js
backend/core/database.js
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_media.js
backend/modules/helpers/helper_core.js
```

Dashboard:

```text
htdocs/dashboard/modules/soundalerts.js
htdocs/dashboard/modules/soundalerts.css
```

Overlay:

```text
htdocs/overlays/sound_system_overlay.html
```

Config/Fallback:

```text
config/soundalerts_bridge.json
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
