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

Config/Fallback:

- `config/soundalerts_bridge.json`

DB-Strukturen:

- `soundalerts_bridge_events`
- `soundalerts_bridge_entries`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

SoundAlerts-Version:

- `0.1.11`

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

## SoundAlerts Dokus

- `project-state/STEP193_6_SOUNDALERTS_DASHBOARD_LAYOUT_CLEANUP_2026-05-06.md`
- `project-state/STEP193_6_1_SOUNDALERTS_OBS_LOADER_STANDARD_2026-05-06.md`
- `project-state/STEP193_7_SOUNDALERTS_OVERVIEW_DASHBOARD_2026-05-06.md`
- `project-state/STEP193_7_1_SOUNDALERTS_INACTIVE_FILTER_FIX_2026-05-06.md`
- `project-state/STEP193_7_2_SOUNDALERTS_OVERVIEW_STATS_CLEANUP_2026-05-06.md`
- `project-state/STEP193_7_3_SOUNDALERTS_OVERVIEW_ACTION_STATE_CLEANUP_2026-05-06.md`
- `project-state/STEP193_7_4_SOUNDALERTS_EVENT_LOG_CLARITY_2026-05-06.md`
- `project-state/STEP193_8_SOUNDALERTS_REVIEW_WORKFLOW_2026-05-06.md`
- `project-state/STEP193_8_1_SOUNDALERTS_REVIEW_SAVE_SCOPE_FIX_2026-05-06.md`
- `project-state/STEP193_9_SOUNDALERTS_STABLE_HANDOFF_2026-05-06.md`
- `project-state/STEP193_10_SOUNDALERTS_PARSER_FORMAT_FIX_2026-05-06.md`
- `project-state/STEP193_11_SOUNDALERTS_CONFIGURABLE_PARSER_FORMATS_2026-05-06.md`
- `project-state/STEP193_11_1_SOUNDALERTS_PARSER_SETTINGS_SERIALIZATION_FIX_2026-05-06.md`
- `project-state/STEP193_12_SOUNDALERTS_PARSER_FORMATS_DASHBOARD_EDITOR_2026-05-06.md`
- `project-state/STEP193_13_SOUNDALERTS_ENTRY_TEST_BUTTONS_2026-05-06.md`
- `project-state/STEP193_14_SOUNDALERTS_LOCAL_OVERLAY_TEST_WORKFLOW_2026-05-06.md`


## SoundAlerts Parser-Formate

- `<user> spielt <sound> für <amount> Bits!`
- `<user> löst <sound> mit <amount> Bits aus`

- `project-state/STEP193_15_SOUNDALERTS_TEST_OUTPUT_OVERRIDE_2026-05-06.md`

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

## SoundAlerts Parser-Settings

- `parser.messageFormats` = JSON-Liste fuer erkennbare SoundAlerts-Chattexte.
- Pro Format: `id`, `enabled`, `pattern`, `flags`, `triggerGroup`, `soundGroup`, `amountGroup`, `currencyGroup`.

## Parser-Formate Dashboard

- Bedienung unter `SoundAlerts > Bot & Settings > Chat-Erkennung`.
- Speichert `parser.messageFormats` ueber die bestehende Settings-API.
- Lokaler Test legt keinen Event-/DB-Eintrag an.
