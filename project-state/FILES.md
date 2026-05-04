# FILES - stream-control-center

Stand: 2026-05-04

## Hauptpfade

Repo:

- D:\Git\stream-control-center

Live:

- D:\Streaming\stramAssets

GitHub:

- https://github.com/ForrestCGN/stream-control-center

## Easy-Scripts / Deploy-Workflow

Verbindlicher Script-Pfad:

- `D:\Git\stream-control-center\tools\easy\`

Standard-Scripte:

- `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`
- `tools\easy\02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd`
- `tools\easy\03_NUR_STATUS_PRUEFEN.cmd`
- `tools\easy\04_BACKUP_ZURUECKSPIELEN.cmd`

Wichtig:

- Diese Easy-Scripts sind der Standard fuer GitHub-/Live-Arbeiten.
- Nicht auf alte Root-Script-Pfade ausweichen, wenn die Easy-Scripts vorhanden sind.
- Wenn grosse Dateien ueber GitHub/Tools nur gekuerzt gelesen werden koennen, stellt Forrest die echte Datei bereit. Diese echte Datei ist dann die Arbeitsbasis.

## Wichtige Projektdateien

Aktueller Projektstand:

- docs/current/CURRENT_SYSTEM_STATUS.md
- project-state/CURRENT_STATUS.md
- project-state/NEXT_STEPS.md
- project-state/CHANGELOG.md
- project-state/FILES.md

STEP-Dokumentation:

- project-state/STEP002_REPO_LIVE_COMPARE_REVIEW_2026-05-03.md
- project-state/STEP003_DEPLOY_REPO_TO_LIVE_HUG_CLEAN_2026-05-03.md
- project-state/STEP004_FOCUSED_REPO_LIVE_COMPARE_2026-05-03.md
- project-state/STEP005_OBS_API_ALIASES_2026-05-03.md
- project-state/STEP006_OBS_DASHBOARD_API_READS_2026-05-03.md
- project-state/STEP007_DASHBOARD_MOJIBAKE_FIX_2026-05-03.md
- project-state/STEP008_FIREWORKS_DUPLICATE_ROUTES_REVIEW_2026-05-03.md
- project-state/STEP010_OBS_DASHBOARD_API_ACTIONS_2026-05-03.md
- project-state/STEP011_DOCUMENTATION_STRUCTURE_2026-05-03.md
- project-state/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md
- project-state/STEP017_VIP_SOUND_SYSTEM_QUEUE_2026-05-03.md
- project-state/STEP019_VIP_SOUND_OVERRIDE_2026-05-04.md
- project-state/STEP020_VIP_OVERRIDE_LIVE_TEST_2026-05-04.md
- project-state/STEP021_SOUND_SYSTEM_REQUEST_ID_2026-05-04.md
- project-state/STEP022_STREAMERBOT_VIP_ARGS_2026-05-04.md
- project-state/STEP023_VIP_STREAMERBOT_SOUNDSYSTEM_OVERLAY_2026-05-04.md
- project-state/STEP026_VIP_TWITCH_ROLE_HELPER_2026-05-04.md
- project-state/STEP027_VIP_HEIMAUFSICHT_TEXTS_2026-05-04.md
- project-state/STEP028_VIP_DAILY_USAGE_API_2026-05-04.md
- project-state/STEP029_VIP_DAILY_USAGE_API_FIX_2026-05-04.md
- project-state/STEP030_VIP_REFERENCE_STATUS_2026-05-04.md
- project-state/STEP031_VIP_DB_SETTINGS_BASE_2026-05-04.md
- project-state/STEP032_VIP_SOUND_FILE_SETTINGS_ACTIVE_2026-05-04.md
- project-state/STEP033_VIP_EVENTS_STATS_BASE_2026-05-04.md
- project-state/STEP034_VIP_ROLE_OVERRIDES_DB_2026-05-04.md
- project-state/STEP034_1_VIP_ROLE_CONFIG_PATH_FIX_2026-05-04.md
- project-state/STEP029_VIP_DAILY_USAGE_API_FIX_2026-05-04.md
- project-state/STEP030_VIP_REFERENCE_STATUS_2026-05-04.md
- project-state/STEP031_VIP_DB_SETTINGS_BASE_2026-05-04.md
- project-state/STEP032_VIP_SOUND_FILE_SETTINGS_ACTIVE_2026-05-04.md
- project-state/STEP033_VIP_EVENTS_STATS_BASE_2026-05-04.md
- project-state/STEP029_VIP_DAILY_USAGE_API_FIX_2026-05-04.md
- project-state/STEP030_VIP_REFERENCE_STATUS_2026-05-04.md
- project-state/STEP031_VIP_DB_SETTINGS_BASE_2026-05-04.md
- project-state/STEP026_VIP_TWITCH_ROLE_HELPER_2026-05-04.md
- project-state/STEP027_VIP_HEIMAUFSICHT_TEXTS_2026-05-04.md

## Doku-Struktur

Repo-Doku:

- docs/current/
- docs/backend/
- docs/dashboard/
- docs/database/
- docs/overlays/
- docs/system-inspection/2026-05-03/
- docs/admin/
- docs/auth/
- docs/settings/
- docs/sound_system/
- docs/user/
- docs/_generated/

Live-Doku:

- D:\Streaming\stramAssets\docs\current\
- D:\Streaming\stramAssets\docs\backend\
- D:\Streaming\stramAssets\docs\dashboard\
- D:\Streaming\stramAssets\docs\database\
- D:\Streaming\stramAssets\docs\overlays\
- D:\Streaming\stramAssets\docs\system-inspection\2026-05-03\

Historische Analyse-Snapshots:

- docs/backend/Backend_Systemuebersicht_2026-05-03.txt
- docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt
- docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt
- docs/overlays/overlay_iststand_analyse.txt
- docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt

## Wichtige Codebereiche

Backend:

- backend/server.js
- backend/modules/
- backend/modules/helpers/
- backend/core/

VIP/Sound relevant:

- backend/modules/vip_sound_overlay.js
- backend/modules/sound_system.js
- backend/modules/helpers/helper_messages.js
- backend/modules/helpers/helper_texts.js
- backend/modules/helpers/helper_chat_output.js
- backend/modules/helpers/helper_config.js
- backend/modules/helpers/helper_twitch_roles.js
- backend/modules/helpers/helper_media.js
- backend/modules/sqlite_core.js
- backend/core/database.js
- config/sound_system.json
- config/vip_sound_roles.json
- htdocs/overlays/vip_sound_overlay.html
- htdocs/overlays/vip_sound_overlay_v2.html
- htdocs/overlays/sound_system_overlay.html

VIP sichtbare Chattexte:

- Default-Texte im Code: `backend/modules/vip_sound_overlay.js`
- Live-Texte aus SQLite: `vip_sound_message_templates`
- Sichtbarer Begriff: `Heimaufsicht`
- Interne Style-ID bleibt: `heimleitung`

VIP aktuelle Tabellen in app.sqlite:

- vip_sound_daily_usage
- vip_sound_message_templates
- vip_sound_settings
- vip_sound_events
- vip_sound_role_overrides
- vip_sound_settings
- vip_sound_events
- vip_sound_settings
- vip_sound_settings

Sound-System relevante Route fuer VIP:

- POST /api/sound/play

VIP relevante Routen:

- GET/POST /api/vip-sound/command
- GET/POST /api/vip-sound-overlay/command
- GET /api/vip-sound/status
- GET /api/vip-sound/db/status
- GET /api/vip-sound-overlay/state
- POST /api/vip-sound/reset
- GET /api/vip-sound/daily-usage
- GET /api/vip-sound/daily-usage/today
- POST /api/vip-sound/daily-usage/reset
- POST /api/vip-sound/daily-usage/reset-today
- GET /api/vip-sound/events
- GET /api/vip-sound/events/recent
- GET /api/vip-sound/stats
- GET /api/vip-sound/roles
- POST /api/vip-sound/roles/upsert
- POST /api/vip-sound/roles/delete
- POST /api/vip-sound/roles/import-config
- GET /api/vip-sound/stats
- GET /api/vip-sound/events/recent
- GET /api/vip-sound/events
- GET /api/vip-sound/settings
- GET /api/vip-sound/config

VIP Daily-Usage API Semantik:

- `/daily-usage` zeigt ohne Filter alle Eintraege.
- `/daily-usage/today` zeigt nur heute.
- `/daily-usage/reset` loescht ohne Filter alle Eintraege.
- `/daily-usage/reset-today` loescht nur heute.
- Filter: `date`/`usageDate`, `login`, `soundType`, `limit`.

VIP Override relevant:

- ENV/Config: VIP_OVERRIDE_ALLOWED_ROLES
- Standardrollen: moderator, mod, broadcaster
- STEP-Doku: project-state/STEP019_VIP_SOUND_OVERRIDE_2026-05-04.md
- Live-Test-Doku: project-state/STEP020_VIP_OVERRIDE_LIVE_TEST_2026-05-04.md
- RequestId-Fix-Doku: project-state/STEP021_SOUND_SYSTEM_REQUEST_ID_2026-05-04.md
- Streamer.bot Args-Doku: project-state/STEP022_STREAMERBOT_VIP_ARGS_2026-05-04.md
- Streamer.bot/Sound-System/Overlay-V2-Doku: project-state/STEP023_VIP_STREAMERBOT_SOUNDSYSTEM_OVERLAY_2026-05-04.md

Dashboard:

- htdocs/dashboard/app.js
- htdocs/dashboard/app.css
- htdocs/dashboard/index.html
- htdocs/dashboard/modules/

Overlays:

- htdocs/overlays/

Configs:

- config/

Datenbank:

- D:\Streaming\stramAssets\data\sqlite\app.sqlite

VIP-Sounddateien live:

- D:\Streaming\stramAssets\htdocs\assets\sounds\vip\
- Dateiregel aktuell: Anzeigename.mp3
- Beispiel getestet: D:\Streaming\stramAssets\htdocs\assets\sounds\vip\araglor.mp3

Wichtig:

- app.sqlite niemals committen.
- .env/secrets niemals committen.
- Backup-/Altdateien nicht committen.
- VIP-Soundpfad und Dateiregel sind backendseitig ueber `vip_sound_settings` vorbereitet/aktiv; Dashboard-UI folgt spaeter.


## STEP026 VIP Twitch-Rollenhelper

Neu/Geaendert:

- backend/modules/helpers/helper_twitch_roles.js
- backend/modules/vip_sound_overlay.js
- config/vip_sound_roles.json
- project-state/STEP026_VIP_TWITCH_ROLE_HELPER_2026-05-04.md
- project-state/STEP027_VIP_HEIMAUFSICHT_TEXTS_2026-05-04.md

ENV/Secret-Nutzung:

- TWITCH_CLIENT_ID
- TWITCH_BROADCASTER_ID optional, Fallback 127709954
- VIP_TWITCH_USER_TOKEN_PATH optional, Fallback D:/Streaming/stramAssets/secrets/tokens/twitch_user.json
- Token-Datei niemals committen.


## VIP DB-Settings

Neue Tabelle ab STEP031:

- `vip_sound_settings`

Zweck:

- spaetere Dashboard-bearbeitbare VIP-Settings
- Soundpfad/Dateiregel
- Daily-Usage-Retention
- Rollen-/Fallback-Schalter

Lesereihenfolge:

1. SQLite
2. Config-Fallback ueber `helper_config.js`
3. Default im Code


## VIP Settings relevant

Aktive DB-Settings in `vip_sound_settings`:

- `enabled`
- `soundBaseDir`
- `fileNameMode`
- `fileExtension`
- `dailyUsageRetentionDays`
- `cleanupDailyUsageOnStartup`
- `autoDetectTargetRole`
- `fallbackRolesEnabled`

Lesereihenfolge: SQLite -> Config-Fallback ueber `helper_config.js` -> Code-Default.

## VIP Rollen-Fallback/Import

- Primaere Quelle: SQLite-Tabelle `vip_sound_role_overrides`.
- Import-/Fallbackquelle: `config/vip_sound_roles.json`.
- Pfadauflösung erfolgt ueber `backend/modules/helpers/helper_config.js` / `resolveConfigFile`.
- Live-Zielpfad: `D:\Streaming\stramAssets\config\vip_sound_roles.json`.
