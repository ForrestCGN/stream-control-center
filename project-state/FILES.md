# FILES - stream-control-center

Stand: 2026-05-06

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
- `backend/modules/soundalerts_bridge.js`
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
- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`
- `htdocs/dashboard/modules/tagebuch.js`
- `htdocs/dashboard/modules/tagebuch.css`
- `htdocs/dashboard/modules/todo.js`
- `htdocs/dashboard/modules/todo.css`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

Clip-Dashboard ist noch offen.

## STEP192 SoundAlerts relevante Dateien

Backend:

- `backend/modules/soundalerts_bridge.js`
- `backend/core/database.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_config.js`
- `backend/modules/helpers/helper_media.js`
- `backend/modules/helpers/helper_core.js`

Dashboard:

- `htdocs/dashboard/modules/soundalerts.js`

Config/Fallback:

- `config/soundalerts_bridge.json`

DB-Strukturen:

- `soundalerts_bridge_events`
- `soundalerts_bridge_entries`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

SoundAlerts-Version:

- `0.1.5`

SoundAlerts-Routen:

- `GET /api/soundalerts/status`
- `GET /api/soundalerts/settings`
- `POST /api/soundalerts/settings`
- `GET /api/soundalerts/entries`
- `POST /api/soundalerts/entries`
- `GET /api/soundalerts/config`
- `POST /api/soundalerts/config`

SoundAlerts-Settings:

- `enabled`
- `bot.login`
- `bot.userId`
- `bot.displayName`
- `bot.validateUserinfo`
- `parser.language`
- `parser.allowQuotedSoundNames`
- `parser.allowUnquotedSoundNames`
- `soundSystem.playUrl`
- `soundSystem.soundsBaseDir`
- `soundSystem.allowedExtensions`
- `soundSystem.defaultCategory`
- `soundSystem.defaultPriority`
- `soundSystem.audioOutputTarget`
- `soundSystem.videoOutputTarget`
- `soundSystem.defaultVolume`
- `upload.enabled`
- `upload.audioDir`
- `upload.videoDir`
- `upload.audioRelativePrefix`
- `upload.videoRelativePrefix`
- `upload.allowOverwrite`
- `upload.maxAudioSizeBytes`
- `upload.maxVideoSizeBytes`
- `upload.allowedAudioExtensions`
- `upload.allowedVideoExtensions`
- `chatMessages.enabled`
- `chatMessages.onMissingFile`
- `chatMessages.onUnmatched`
- `chatMessages.cooldownMs`
- `chatMessages.missingFileTemplate`
- `dedupe.enabled`
- `dedupe.windowMs`

SoundAlerts-Dokus:

- `project-state/STEP192_1_1_SOUNDALERTS_DEFAULTS_SAVE_CLEANUP_2026-05-06.md`
- `project-state/STEP192_2_SOUNDALERTS_SETTINGS_DB_2026-05-06.md`
- `project-state/STEP192_2_1_SOUNDALERTS_DB_CORE_PORTABILITY_2026-05-06.md`
- `project-state/STEP192_3_SOUNDALERTS_DOC_SYNC_2026-05-06.md`

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
