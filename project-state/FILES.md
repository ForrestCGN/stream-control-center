# FILES - stream-control-center

Stand: 2026-05-06

## SoundAlerts relevante Dateien

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

Overlay:

- `htdocs/overlays/sound_system_overlay.html`

Config/Fallback:

- `config/soundalerts_bridge.json`

DB-Strukturen:

- `soundalerts_bridge_events`
- `soundalerts_bridge_entries`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

SoundAlerts-Version:

- `0.1.14`

Aktueller Upload-Wert live:

```text
upload.maxVideoSizeBytes = 1073741824
```

## SoundAlerts Statuswerte im Dashboard

- `review_required` / `file_matched` = `Zur Pruefung`
- `active` = aktiv nutzbarer Eintrag
- `inactive` = gespeichert, aber bewusst deaktiviert
- `missing_file` = Name/Datei fehlt oder Platzhalter-Datei
- `ignored` = bewusst ignoriert, nicht prominent im normalen Workflow

## SoundAlerts Parser

- Settings-Key: `parser.messageFormats`
- Speicherort: `soundalerts_bridge_settings`
- Werttyp: JSON / Objekt-Array
- Darf nicht als `[object Object]` gespeichert werden.

## SoundAlerts Dokus

- `project-state/STEP193_10_SOUNDALERTS_PARSER_FORMAT_FIX_2026-05-06.md`
- `project-state/STEP193_11_SOUNDALERTS_CONFIGURABLE_PARSER_FORMATS_2026-05-06.md`
- `project-state/STEP193_11_1_SOUNDALERTS_PARSER_SETTINGS_SERIALIZATION_FIX_2026-05-06.md`
- `project-state/STEP193_12_SOUNDALERTS_PARSER_FORMATS_DASHBOARD_EDITOR_2026-05-06.md`
- `project-state/STEP193_13_SOUNDALERTS_ENTRY_TEST_BUTTONS_2026-05-06.md`
- `project-state/STEP193_14_SOUNDALERTS_LOCAL_OVERLAY_TEST_WORKFLOW_2026-05-06.md`
- `project-state/STEP193_15_SOUNDALERTS_TEST_OUTPUT_OVERRIDE_2026-05-06.md`
- `project-state/STEP193_15_1_SOUNDALERTS_DOC_SYNC_2026-05-06.md`
- `project-state/STEP193_16_SOUNDALERTS_ENTRY_EDITOR_OUTPUT_AND_SELECTION_FIX_2026-05-06.md`
- `project-state/STEP193_17_SOUNDALERTS_OUTPUT_FIELD_CLEANUP_2026-05-06.md`
- `project-state/STEP193_17_1_SOUNDALERTS_FILTER_REGRESSION_FIX_2026-05-06.md`

## OBS Loader Standard

- `_SoundAlerts_Loader` als dauerhaft aktive 1x1-OBS-Browserquelle.
- Audio im OBS-Mixer stumm.
- Quelle nicht per Auge deaktivieren.
- Bild/Ton-Ausgabe ueber eigenes Sound-System.

## Nie committen

- `.env`
- Secrets
- Tokens
- SQLite-/DB-Dateien
- Backups
- ZIP/7z-Dateien
- temporaere Dateien
