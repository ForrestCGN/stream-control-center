# FILES - stream-control-center

Stand: 2026-05-04

## Hauptpfade

Repo:

- D:\Git\stream-control-center

Live:

- D:\Streaming\stramAssets

GitHub:

- https://github.com/ForrestCGN/stream-control-center

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
- backend/modules/helpers/helper_media.js
- backend/modules/sqlite_core.js
- backend/core/database.js
- config/sound_system.json
- htdocs/overlays/vip_sound_overlay.html
- htdocs/overlays/vip_sound_overlay_v2.html
- htdocs/overlays/sound_system_overlay.html

VIP aktuelle Tabellen in app.sqlite:

- vip_sound_daily_usage
- vip_sound_message_templates

Sound-System relevante Route fuer VIP:

- POST /api/sound/play

VIP relevante Routen:

- GET/POST /api/vip-sound/command
- GET/POST /api/vip-sound-overlay/command
- GET /api/vip-sound/status
- GET /api/vip-sound/db/status
- GET /api/vip-sound-overlay/state
- POST /api/vip-sound/reset

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
- VIP-Soundpfad spaeter konfigurierbar machen.
