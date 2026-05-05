# FILES - stream-control-center

Stand: 2026-05-05

## Hauptpfade

Repo:

- `D:\Git\stream-control-center`

Live:

- `D:\Streaming\stramAssets`

GitHub:

- `https://github.com/ForrestCGN/stream-control-center`

Branch:

- `dev`

## Easy-Scripts / Deploy-Workflow

Verbindlicher Script-Pfad:

- `D:\Git\stream-control-center\tools\easy\`

Standard-Scripte:

- `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd`
- `tools\easy\02_LOKALE_AENDERUNGEN_ZU_GITHUB_HOCHLADEN.cmd`
- `tools\easy\03_NUR_STATUS_PRUEFEN.cmd`
- `tools\easy\04_BACKUP_ZURUECKSPIELEN.cmd`

## Stepdone Workflow

Nach manuellem Entpacken eines ZIPs nach Repo-Root:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "commit beschreibung"
```

Relevante Datei:

- `stepdone.cmd`

Zweck:

- Git-Status anzeigen
- JS-Syntax pruefen
- relevante Projektdateien vormerken
- Sicherheitscheck gegen Secrets/DB/Backups/ZIPs
- Commit
- Push nach `origin/dev`
- Live-Deploy ueber bekanntes Easy-Script

## Aktive bekannte Backend-Dateien

- `backend/modules/alert_system.js`
- `backend/modules/tts_system.js`
- `backend/modules/vip_sound_overlay.js`
- `backend/modules/hug.js`
- `backend/modules/tagebuch.js`
- `backend/modules/todo.js`
- `backend/modules/clips.js`
- `backend/modules/twitch.js`
- `backend/modules/obs.js`
- `backend/modules/obs_shared.js`
- `backend/modules/discord.js`
- `backend/core/database.js`
- `backend/modules/helpers/helper_texts.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_messages.js`
- `backend/modules/helpers/helper_config.js`
- `backend/modules/helpers/helper_core.js`
- `backend/modules/helpers/helper_routes.js`

## Aktive bekannte Dashboard-Dateien

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.js`
- `htdocs/dashboard/app.css`
- `htdocs/dashboard/modules/sectionhome.js`
- `htdocs/dashboard/modules/sectionhome.css`
- `htdocs/dashboard/modules/streamdesk.js`
- `htdocs/dashboard/modules/streamdesk.css`
- `htdocs/dashboard/modules/controlhome.js`
- `htdocs/dashboard/modules/controlhome.css`
- `htdocs/dashboard/modules/alerts.js`
- `htdocs/dashboard/modules/alerts.css`
- `htdocs/dashboard/modules/obs.js`
- `htdocs/dashboard/modules/obs.css`
- `htdocs/dashboard/modules/adminconfigs.js`
- `htdocs/dashboard/modules/adminconfigs.css`
- `htdocs/dashboard/modules/sound.js`
- `htdocs/dashboard/modules/sound.css`
- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- `htdocs/dashboard/modules/tagebuch.js`
- `htdocs/dashboard/modules/tagebuch.css`
- `htdocs/dashboard/modules/todo.js`
- `htdocs/dashboard/modules/todo.css`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

Clip-Dashboard ist noch offen.

## STEP183-187 Clip relevante Dateien

Backend:

- `backend/modules/clips.js`
- `backend/modules/twitch.js`
- `backend/modules/obs_shared.js`
- `backend/modules/discord.js`
- `backend/core/database.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_texts.js`
- `backend/modules/helpers/helper_messages.js`

Config/Fallback:

- `config/clip_system.json`
- `config/messages/clips.json`
- `config/discord_channels.json`

DB-Strukturen:

- `clip_history`
- `clip_settings`
- `module_text_variants` mit `module = clips`

Clip-History Schema-Version:

- `3`

Clip-Settings:

- `enabled`
- `backendCreateEnabled`
- `defaultClipTitle`
- `includeGameInCustomTitle`
- `twitchClipDurationSeconds`
- `twitchClipPollMs`
- `twitchClipPollMaxAttempts`
- `obsReplaySaveEnabled`
- `obsReplayWindowSeconds`
- `obsReplayPreTriggerSeconds`
- `obsReplayPostTriggerSeconds`
- `obsReplaySaveDelayMs`
- `localReplayRenameEnabled`
- `localReplayRenameDelayMs`
- `localReplayDir`
- `localReplayLookbackMinutes`
- `sendClipActivatedMessage`
- `sendTwitchClipResultMessage`
- `sendChatResponse`
- `discordPostEnabled`
- `discordChannelMode`
- `discordChannelKey`
- `discordChannelId`
- `postOnlyWhenLive`
- `saveHistory`
- `duplicatePolicy`

Clip-Textkategorien:

- `chat`
- `discord`
- `errors`
- `system`

Clip-Routen:

- `GET /api/clip/status`
- `GET /api/clip/title`
- `GET/POST /api/clip/register`
- `GET /api/clip/history`
- `GET/POST /api/clip/create`
- `GET /api/clip/job/:jobId`
- `GET/POST /api/clip/admin/settings`
- `GET/POST /api/dashboard/clips/settings`
- `GET/POST /api/clip/admin/texts`
- `GET/POST /api/dashboard/clips/texts`

Twitch-Validate-Routen:

- `GET /auth/validate`
- `GET /twitch/auth/validate`
- `GET /api/twitch/auth/validate`

OBS-Replay-Routen:

- `GET /api/obs/replay/status`
- `POST /api/obs/replay/start`
- `POST /api/obs/replay/stop`
- `POST /api/obs/replay/save`

Clip-Dokus:

- `project-state/STEP183_CLIP_BACKEND_INTEGRATION_2026-05-05.md`
- `project-state/STEP184_CLIP_API_READINESS_2026-05-05.md`
- `project-state/STEP185_CLIP_DB_SETTINGS_TEXTS_2026-05-05.md`
- `project-state/STEP185_5_CLIP_DISCORD_CHANNEL_AND_TEXT_CLEANUP_2026-05-05.md`
- `project-state/STEP186_CLIP_BACKEND_CREATE_TWITCH_DISCORD_2026-05-05.md`
- `project-state/STEP186_1_CLIP_SCHEMA_MIGRATION_FIX_2026-05-05.md`
- `project-state/STEP186_2_CLIP_CREATE_OFFLINE_GUARD_2026-05-05.md`
- `project-state/STEP187_CLIP_LOCAL_REPLAY_FILE_HANDLING_2026-05-05.md`
- `project-state/STEP187_5_CLIP_BACKEND_FLOW_DOC_SYNC_2026-05-05.md`

## STEP181/182 Hug/Rehug relevante Dateien

Backend:

- `backend/modules/hug.js`

Dashboard:

- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`

Config/Fallback:

- `config/hug_system.json`
- `config/messages/hug.json`

DB-Strukturen:

- `hug_text_pairs`
- `hug_pending_rehugs.pair_id`
- `hug_users`
- `hug_pair_stats`
- `hug_pending_rehugs`
- `hug_settings`
- `hug_types`
- `hug_texts`

## STEP177/179/180 Tagebuch/Todo relevante Dateien

Backend:

- `backend/modules/helpers/helper_texts.js`
- `backend/modules/tagebuch.js`
- `backend/modules/todo.js`

Dashboard:

- `htdocs/dashboard/modules/tagebuch.js`
- `htdocs/dashboard/modules/tagebuch.css`
- `htdocs/dashboard/modules/todo.js`
- `htdocs/dashboard/modules/todo.css`

DB-Strukturen:

- `module_texts`
- `module_text_variants`
- `tagebuch_settings`
- `todo_settings`

## STEP175 VIP relevante Dateien

Backend:

- `backend/modules/vip_sound_overlay.js`

Dashboard:

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

Overlay:

- `htdocs/overlays/vip_sound_overlay_v2.html`

## Nie committen

- `.env`
- Secrets
- Tokens
- SQLite-/DB-Dateien
- Backups
- ZIP/7z-Dateien
- temporaere Dateien
- alte kaputte Chat-Reste
