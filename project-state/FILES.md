# FILES - stream-control-center

Stand: 2026-05-08

## TTS relevante Dateien

Backend:

- `backend/modules/tts_system.js`
- `backend/core/database.js`
- `backend/modules/helpers/helper_settings.js`
- `backend/modules/helpers/helper_config.js`
- `backend/modules/helpers/helper_media.js`
- `backend/modules/helpers/helper_core.js`

Dashboard:

- `htdocs/dashboard/modules/tts.js`
- `htdocs/dashboard/modules/tts.css`
- `htdocs/dashboard/index.html`

Config/Fallback:

- `config/tts_config.json`
- `config/tts_messages.json`
- `config/tts_bans.json`
- `config/tts_state.json`

Wichtig:

- `config/tts_config.json` bleibt Seed/Fallback/technische Boot-Konfig.
- `config/tts_messages.json` ist aktuell noch JSON-basiert und soll spaeter ins globale DB-Textvarianten-System migriert werden.
- Google/Piper technische Pfade duerfen nicht in oeffentlichen/normalen Dashboard-Antworten sichtbar werden.
- Keine separate TTS-Admin-Datei als Zielstand.

TTS DB-Strukturen:

- `tts_events`
- `tts_usage_daily`
- `tts_settings`

TTS wichtige Routen:

```text
GET      /api/tts/status
GET      /api/tts/config
GET      /api/tts/voices
GET      /api/tts/routes
GET      /api/tts/admin/settings
POST     /api/tts/admin/settings
GET      /api/tts/stats
GET      /api/tts/stats/users
GET      /api/tts/events
GET/POST /api/tts/say
GET/POST /api/tts/reload
GET/POST /api/tts/on
GET/POST /api/tts/off
GET/POST /api/tts/stop
GET/POST /api/tts/clear
```

TTS Dashboard Tabs:

- Uebersicht
- User-Statistik
- Stimmen
- Rollen
- Sound-System
- Settings
- Test
- Events
- Routen

TTS Dokus:

- `project-state/STEP199_1_TTS_STANDARD_ADMIN_API_2026-05-08.md`
- `project-state/STEP199_2_TTS_DASHBOARD_MODULE_2026-05-08.md`
- `project-state/STEP199_3_TTS_USER_STATS_2026-05-08.md`
- `project-state/STEP199_4_TTS_DASHBOARD_STATS_POLISH_2026-05-08.md`
- `project-state/STEP199_5_TTS_DOC_SYNC_2026-05-08.md`

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

## Ausgabe-/Testlogik

- Audio nutzt das globale Audio-Ziel.
- Video nutzt das globale Video-Ziel.
- Manuelles Ausgabe-Dropdown ist aus dem Eintrag-Editor entfernt.
- Normaler Test nutzt gespeichertes Ausgabeziel.
- Overlay-Test darf temporaer `outputTarget=overlay` senden.

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
- `project-state/STEP193_17_2_SOUNDALERTS_FINAL_DOC_SYNC_2026-05-06.md`

## Loyalty / StreamElements Migration Dokus

- `project-state/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md`

Geplante spaeter betroffene Bereiche:

Backend:

- `backend/modules/loyalty.js`
- `backend/modules/loyalty_rewards.js`
- `backend/modules/giveaways.js`
- `backend/modules/loyalty_games.js`
- `backend/core/database.js`
- vorhandene Helper fuer Settings/Texte/Config/Media

Dashboard:

- `htdocs/dashboard/modules/loyalty.js`
- `htdocs/dashboard/modules/loyalty.css`
- `htdocs/dashboard/modules/giveaways.js`
- `htdocs/dashboard/modules/giveaways.css`
- `htdocs/dashboard/modules/loyalty_games.js`
- `htdocs/dashboard/modules/loyalty_games.css`

Overlays:

- `htdocs/overlays/loyalty-games-overlay.html`

Config/Fallback:

- `config/loyalty.json`
- `config/giveaways.json`
- `config/loyalty_games.json`

Geplante DB-Strukturen:

- `loyalty_users`
- `loyalty_transactions`
- `loyalty_settings`
- `loyalty_reservations`
- `loyalty_imports`
- `loyalty_ignored_users`
- `loyalty_rewards`
- `loyalty_reward_categories`
- `loyalty_redemptions`
- `loyalty_reward_cooldowns`
- `giveaways`
- `giveaway_entries`
- `giveaway_winners`
- `giveaway_settings`
- `giveaway_assets`
- `loyalty_games`
- `loyalty_game_settings`
- `loyalty_game_sessions`
- `loyalty_game_entries`
- `loyalty_game_results`

Wichtige Loyalty-Regel:

```text
Alles, was Kekskruemel gibt, nimmt, prueft, reserviert, erstattet oder veraendert, laeuft ausschliesslich ueber das Loyalty-System.
```

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
