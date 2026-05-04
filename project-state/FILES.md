# FILES - stream-control-center

Stand: 2026-05-04

## Hauptpfade

Repo:

- `D:\Git\stream-control-center`

Live:

- `D:\Streaming\stramAssets`

GitHub:

- `https://github.com/ForrestCGN/stream-control-center`

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

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

Wichtigster VIP-Dashboard-Einstieg:

- `project-state/STEP040_VIP_BACKEND_REFERENCE_DASHBOARD_READY_2026-05-04.md`

## STEP-Dokumentation VIP aktuell

- `project-state/STEP026_VIP_TWITCH_ROLE_HELPER_2026-05-04.md`
- `project-state/STEP027_VIP_HEIMAUFSICHT_TEXTS_2026-05-04.md`
- `project-state/STEP028_VIP_DAILY_USAGE_API_2026-05-04.md`
- `project-state/STEP029_VIP_DAILY_USAGE_API_FIX_2026-05-04.md`
- `project-state/STEP030_VIP_REFERENCE_STATUS_2026-05-04.md`
- `project-state/STEP031_VIP_DB_SETTINGS_BASE_2026-05-04.md`
- `project-state/STEP032_VIP_SOUND_FILE_SETTINGS_ACTIVE_2026-05-04.md`
- `project-state/STEP033_VIP_EVENTS_STATS_BASE_2026-05-04.md`
- `project-state/STEP034_VIP_ROLE_OVERRIDES_DB_2026-05-04.md`
- `project-state/STEP034_1_VIP_ROLE_CONFIG_PATH_FIX_2026-05-04.md`
- `project-state/STEP035_VIP_TEXT_API_2026-05-04.md`
- `project-state/STEP036_HELPER_SETTINGS_BASE_2026-05-04.md`
- `project-state/STEP037_VIP_USE_HELPER_SETTINGS_2026-05-04.md`
- `project-state/STEP038_VIP_SETTINGS_WRITE_API_2026-05-04.md`
- `project-state/STEP039_VIP_ADMIN_TEST_ROUTES_2026-05-04.md`
- `project-state/STEP040_VIP_BACKEND_REFERENCE_DASHBOARD_READY_2026-05-04.md`

## Doku-Struktur

Repo-Doku:

- `docs/current/`
- `docs/backend/`
- `docs/dashboard/`
- `docs/database/`
- `docs/overlays/`
- `docs/system-inspection/2026-05-03/`
- `docs/admin/`
- `docs/auth/`
- `docs/settings/`
- `docs/sound_system/`
- `docs/user/`
- `docs/_generated/`

Live-Doku:

- `D:\Streaming\stramAssets\docs\current\`
- `D:\Streaming\stramAssets\docs\backend\`
- `D:\Streaming\stramAssets\docs\dashboard\`
- `D:\Streaming\stramAssets\docs\database\`
- `D:\Streaming\stramAssets\docs\overlays\`
- `D:\Streaming\stramAssets\docs\system-inspection\2026-05-03\`

Historische Analyse-Snapshots:

- `docs/backend/Backend_Systemuebersicht_2026-05-03.txt`
- `docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt`
- `docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt`
- `docs/overlays/overlay_iststand_analyse.txt`
- `docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt`

## Wichtige Codebereiche

Backend:

- `backend/server.js`
- `backend/modules/`
- `backend/modules/helpers/`
- `backend/core/`

Zentrale Helper:

- `backend/modules/helpers/helper_config.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_messages.js`
- `backend/modules/helpers/helper_texts.js`
- `backend/modules/helpers/helper_chat_output.js`
- `backend/modules/helpers/helper_media.js`
- `backend/modules/helpers/helper_twitch_roles.js`
- `backend/core/database.js`

VIP/Sound relevant:

- `backend/modules/vip_sound_overlay.js`
- `backend/modules/sound_system.js`
- `config/sound_system.json`
- `config/vip_sound_roles.json`
- `htdocs/overlays/vip_sound_overlay.html`
- `htdocs/overlays/vip_sound_overlay_v2.html`
- `htdocs/overlays/sound_system_overlay.html`

## VIP aktuelle Tabellen in app.sqlite

- `vip_sound_daily_usage`
- `vip_sound_message_templates`
- `vip_sound_settings`
- `vip_sound_events`
- `vip_sound_role_overrides`

## VIP relevante Routen

Status / Summary:

- `GET /api/vip-sound/status`
- `GET /api/vip-sound/db/status`
- `GET /api/vip-sound/admin/summary`

Command / Test:

- `GET/POST /api/vip-sound/command`
- `GET/POST /api/vip-sound-overlay/command`
- `POST /api/vip-sound/test`
- `POST /api/vip-sound/admin/test`

Daily-Usage:

- `GET /api/vip-sound/daily-usage`
- `GET /api/vip-sound/daily-usage/today`
- `POST /api/vip-sound/daily-usage/reset`
- `POST /api/vip-sound/daily-usage/reset-today`
- `GET/POST /api/vip-sound/admin/reset-daily`

Events / Statistik:

- `GET /api/vip-sound/events`
- `GET /api/vip-sound/events/recent`
- `GET /api/vip-sound/stats`

Settings:

- `GET /api/vip-sound/settings`
- `GET /api/vip-sound/config`
- `POST /api/vip-sound/settings/upsert`
- `POST /api/vip-sound/settings/delete`
- `POST /api/vip-sound/settings/reset-defaults`

Rollen:

- `GET /api/vip-sound/roles`
- `POST /api/vip-sound/roles/upsert`
- `POST /api/vip-sound/roles/delete`
- `POST /api/vip-sound/roles/import-config`

Texte:

- `GET /api/vip-sound/texts`
- `GET /api/vip-sound/texts/event-keys`
- `POST /api/vip-sound/texts/upsert`
- `POST /api/vip-sound/texts/toggle`
- `POST /api/vip-sound/texts/delete`

Sound-System relevante Route fuer VIP:

- `POST /api/sound/play`

## Dashboard

- `htdocs/dashboard/app.js`
- `htdocs/dashboard/app.css`
- `htdocs/dashboard/index.html`
- `htdocs/dashboard/modules/`

Dashboard soll spaeter nicht direkt SQLite oder Dateien anfassen, sondern Backend-APIs nutzen.

## Datenbank

- `D:\Streaming\stramAssets\data\sqlite\app.sqlite`

Wichtig:

- `app.sqlite` niemals committen.
- `.env`/Secrets niemals committen.
- Backup-/Altdateien nicht committen.

## VIP-Sounddateien live

- `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`
- Aktuell per DB-Settings steuerbar:
  - `soundBaseDir`
  - `fileNameMode`
  - `fileExtension`
- Beispiel getestet:
  - `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\araglor.mp3`

## Settings-/Config-Strategie

- Dashboard-faehige Werte primaer in DB.
- JSON-Dateien nur fuer technische Configs, Fallbacks oder Imports.
- `helper_config.js` bleibt fuer JSON-Dateien/Pfade.
- `helper_settings.js` ist zentrale DB-Settings-Schicht.
- ENV/Secrets bleiben ausserhalb von DB und Repo.

## Spaeter pruefen / angleichen

Bestehende Systeme sollen vor oder waehrend des Dashboard-Ausbaus auf denselben Standard geprueft werden:

- VIP
- Sound-System
- Alerts
- Hug
- Messages/Rotator
- Tagebuch
- Todo
- OBS/Scene-Control
- Twitch/Presence
- Overlay-Chat
