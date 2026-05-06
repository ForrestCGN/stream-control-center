# FILES - stream-control-center

Stand: 2026-05-06

## STEP192/193 SoundAlerts relevante Dateien

Backend:

- `backend/modules/soundalerts_bridge.js`
- `backend/core/database.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_config.js`
- `backend/modules/helpers/helper_media.js`
- `backend/modules/helpers/helper_core.js`

Dashboard:

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`

Config/Fallback:

- `config/soundalerts_bridge.json`

DB-Strukturen:

- `soundalerts_bridge_events`
- `soundalerts_bridge_entries`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

SoundAlerts-Version:

- `0.1.9`

SoundAlerts-Routen:

- `GET /api/soundalerts/status`
- `GET /api/soundalerts/settings`
- `POST /api/soundalerts/settings`
- `GET /api/soundalerts/entries`
- `POST /api/soundalerts/entries`
- `DELETE /api/soundalerts/entries/:entryKey`
- `POST /api/soundalerts/entries/:entryKey/delete`
- `POST /api/soundalerts/entries/:entryKey/ignore`
- `GET /api/soundalerts/config`
- `POST /api/soundalerts/config`
- `POST /api/soundalerts/test/chat`
- `GET /api/soundalerts/events`
- `GET /api/soundalerts/stats`

Aktueller Upload-Wert live:

```text
upload.maxVideoSizeBytes = 1073741824
```

SoundAlerts-Auto-Entry-Statuswerte:

- `active` = aktiv nutzbarer Eintrag
- `missing_file` = automatisch erkannt, aber Datei fehlt
- `file_matched` = automatisch erkannt und Datei wurde passend gefunden
- `ignored` = bewusst ignorierter Auto-Eintrag, wird nicht erneut als offen angelegt
- `disabled`/inaktiv = bewusst nicht abspielbereit

SoundAlerts-Dokus:

- `project-state/STEP193_5_SOUNDALERTS_UPLOAD_UX_IGNORE_DELETE_DOC_SYNC_2026-05-06.md`
- `project-state/STEP193_6_SOUNDALERTS_DASHBOARD_LAYOUT_CLEANUP_2026-05-06.md`
- `project-state/STEP193_6_1_SOUNDALERTS_OBS_LOADER_STANDARD_2026-05-06.md`
- `project-state/STEP193_7_SOUNDALERTS_OVERVIEW_DASHBOARD_2026-05-06.md`

OBS Loader Standard:

- `_SoundAlerts_Loader` als dauerhaft aktive 1x1-OBS-Browserquelle.
- Audio im OBS-Mixer stumm.
- Quelle nicht per Auge deaktivieren.

## Nie committen

- `.env`
- Secrets
- Tokens
- SQLite-/DB-Dateien
- Backups
- ZIP/7z-Dateien
- temporaere Dateien
