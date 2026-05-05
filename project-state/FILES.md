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
- `backend/modules/helpers/helper_texts.js`
- `backend/modules/helpers/helper_settings.js`

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

## STEP181/182 Hug/Rehug relevante Dateien

Backend:

- `backend/modules/hug.js`

Dashboard:

- `htdocs/dashboard/modules/hug.js`
- `htdocs/dashboard/modules/hug.css`

Config/Fallback:

- `config/hug_system.json`
- `config/messages/hug.json`

Doku:

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP181_HUG_REHUG_TEXT_PAIRS_BACKEND_2026-05-05.md`
- `project-state/STEP181_2_HUG_REHUG_TEXT_PAIR_DASHBOARD_2026-05-05.md`
- `project-state/STEP181_4_HUG_SIMPLIFY_NO_TYPES_2026-05-05.md`
- `project-state/STEP181_7_STEPDONE_CMD_ONLY_2026-05-05.md`
- `project-state/STEP181_8_HUG_REHUG_DOC_SYNC_2026-05-05.md`
- `project-state/STEP182_1_HUG_DASHBOARD_UX_TEXTPAIR_LABELS_2026-05-05.md`
- `project-state/STEP182_2_HUG_DASHBOARD_UX_TEXTAREA_WIDTH_2026-05-05.md`
- `project-state/STEP182_3_HUG_ALL_TEXT_EDITOR_2026-05-05.md`
- `project-state/STEP182_4_HUG_RESPONSE_TEXT_EDITOR_2026-05-05.md`
- `project-state/STEP182_5_HUG_TOP_TITLE_EDITOR_2026-05-05.md`
- `project-state/STEP182_6_HUG_TEXT_EDITOR_DOC_SYNC_2026-05-05.md`

## STEP181/182 DB-Strukturen

Sanft per `CREATE TABLE IF NOT EXISTS` / Migration:

- `hug_text_pairs`
- `hug_pending_rehugs.pair_id`

Bestehende Tabellen bleiben erhalten:

- `hug_users`
- `hug_pair_stats`
- `hug_pending_rehugs`
- `hug_settings`
- `hug_types`
- `hug_texts`

Hug-Texte:

- `hug_text_pairs` fuer gekoppelte Hug/Rehug-Paare
- `hug_texts.kind = hug_all` fuer chatweite Hugs
- `hug_texts.kind = response` fuer Systemantworten
- `hug_texts.kind = top_title` fuer Toplisten-Titel

Keine SQLite-Datei wird committed oder ersetzt.

## STEP181/182 Hug-Routen

Status:

- `GET /api/hug/status`
- `GET /api/hug/db/status`
- `GET /api/dashboard/community/hug/status`

Textpaare:

- `GET /api/hug/admin/text-pairs`
- `POST /api/hug/admin/text-pairs`
- `GET /api/dashboard/community/hug/text-pairs`
- `POST /api/dashboard/community/hug/text-pairs`

Chatweite Hugs:

- `GET /api/hug/admin/hug-all-texts`
- `POST /api/hug/admin/hug-all-texts`
- `GET /api/dashboard/community/hug/hug-all-texts`
- `POST /api/dashboard/community/hug/hug-all-texts`

Systemantworten:

- `GET /api/hug/admin/response-texts`
- `POST /api/hug/admin/response-texts`
- `GET /api/dashboard/community/hug/response-texts`
- `POST /api/dashboard/community/hug/response-texts`

Toplisten:

- `GET /api/hug/admin/top-title-texts`
- `POST /api/hug/admin/top-title-texts`
- `GET /api/dashboard/community/hug/top-title-texts`
- `POST /api/dashboard/community/hug/top-title-texts`

Bestehende Hug-/Rehug-Routen und Streamer.bot-Kompatibilitaet bleiben erhalten.

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
