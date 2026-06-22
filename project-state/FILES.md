## Dateien – STEP_HT2_3_HYPETRAIN_PRODUCTIVE_END_ACTIONS

Geaendert:

```text
backend/modules/hypetrain.js
docs/modules/hypetrain.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

Nicht geaendert:

```text
backend/modules/twitch_events.js
backend/modules/sound_system.js
backend/modules/tagebuch.js
backend/modules/discord.js
htdocs/dashboard/*
Datenbank-Schema
Media-System
```

---

## Dateien – STEP_HT2_2_HYPETRAIN_DASHBOARD_TABS

Geändert/ergänzt:

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/hypetrain.js
htdocs/dashboard/modules/hypetrain.css
docs/modules/hypetrain.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

Nicht geändert:

```text
backend/modules/hypetrain.js
backend/modules/twitch_events.js
Datenbank
Sound-System
Media-System
Tagebuch
Discord-Modul
```

---

## Dateien – STEP_DOC_MEDIA_SYSTEM_UPLOAD_MODAL_RULE

Geändert:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

Nicht geändert:

```text
Backend-Code
Dashboard-Code
Datenbank
Config-Dateien
Overlays
```

---

## Dateien – STEP_DOC_MASTER_PROMPT_STEPDONE_DESCRIPTION_RULE

Geändert:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

Nicht geändert:

```text
backend/modules/hypetrain.js
htdocs/dashboard/*
Datenbank
Config-Dateien
Sound-System
Twitch-Events
```

---

## Dateien – STEP_HT2_1_FIX1_HYPETRAIN_PREVIEW_LINEBREAK

Geändert:

```text
backend/modules/hypetrain.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

Nicht geändert:

```text
backend/modules/twitch_events.js
backend/modules/sound_system.js
backend/modules/discord.js
backend/modules/tagebuch.js
htdocs/dashboard/index.html
htdocs/dashboard/app.js
Datenbankdatei
```

---

## Dateien – STEP_HT2_1_HYPETRAIN_BACKEND_DB_STATUS_PREVIEW

Stand: 2026-06-21

### Neu / geaendert

```text
backend/modules/hypetrain.js
docs/modules/hypetrain.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```

### Bewusst nicht geaendert

```text
backend/modules/twitch_events.js
backend/modules/discord.js
backend/modules/tagebuch.js
backend/modules/sound_system.js
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/*
config/twitch_events.json
Datenbankdatei app.sqlite
```

### Neue DB-Tabellen bei Runtime/Migration

```text
hypetrain_runs
hypetrain_contributions
hypetrain_runtime_events
hypetrain_settings
module_text_variants (module_name = hypetrain)
```

---

## Dateien – STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

Stand: 2026-06-21

### Vorherige Fix-Dateien aus dem SO-Sync-Step

```text
backend/modules/clip_shoutout.js
docs/current/STEP_SO_SYNC_OFFICIAL_AFTER_REAL_CLIP_END.md
docs/current/STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX.md
```

### Doku-/Projektstand-Dateien dieses Abschlussstands

```text
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_SO_SYNC_2026-06-21.md
docs/current/NEXT_CHAT_PROMPT_SO_SYNC_2026-06-21.md
docs/current/STEP_SO_SYNC_FINAL_VERIFIED_2026-06-21.md
```

### Nicht geändert durch diesen Doku-Abschluss

```text
Datenbank
Sound-System
Sound-Overlay
Dashboard
Streamer.bot
OBS
Config-Dateien
```

### Wichtige Testdatei

```text
D:\Git\stream-control-center\_tmp\logs\so_sync_final_test_20260621_124845.txt
```

---

## Dateien – STEP_HT1_FIX1_HYPETRAIN_MEDIA_SAVE

Geändert:

- `htdocs/dashboard/modules/twitch_events.js`
  - Fix: Hype-Train-Rekord-Config wird vor dem Re-Rendern gelesen, damit die MediaField-Auswahl (`recordSound.mediaId`) gespeichert wird.

Projektstand aktualisiert:

- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

Nicht geändert:

- Backend
- Datenbank
- Sound-System
- Media-System
- Tagebuch

---

# FILES – relevante Dateien

Stand: 2026-06-17 06:55

## EventSound / Sound-System / Runtime-Dashboard

```text
backend/modules/sound_system.js
backend/modules/stream_events.js
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
htdocs/overlays/stream_events/event_runtime_overlay.html
docs/current/CURRENT_CHAT_HANDOFF_EVENT_SOUND_RUNTIME_2026-06-17.md
docs/current/NEXT_CHAT_PROMPT_EVENT_SOUND_RUNTIME_2026-06-17.md
docs/modules/SOUND_SYSTEM.md
docs/modules/stream_events.md
docs/overlays/event_runtime_overlay.md
docs/testing/SOUND_EVENT_RUNTIME_TESTFLOW.md
```

STEP-ZIPs:

```text
SOUND-DASH-1_RECENT_PLAYBACK_AND_GAP_STATUS.zip
SOUND-DASH-1B_BACKEND_STATUS_CLEANUP.zip
SOUND-GAP-2_PLAYBACK_LOG_AUDIO_END_AND_GAP_END.zip
SOUND-DASH-2_RECENT_PLAYBACK_AUDIO_GAP_COLUMNS.zip
SOUND-DASH-2B_RECENT_PLAYBACK_BADGE_UX.zip
DOCS-EVENT-SOUND-RUNTIME-2026-06-17.zip
```

---

# FILES – relevante Dateien

Stand: 2026-06-15 19:55

## Backend

```text
backend/modules/loyalty.js
backend/modules/loyalty_giveaways.js
backend/modules/twitch_events.js
backend/modules/alerts_twitch_events.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_chat_output.js
```

## Dashboard Repo-Pfade

```text
dashboard/modules/loyalty.js
dashboard/modules/loyalty_games.js
dashboard/modules/loyalty_games.css
```

## Dashboard Live-Pfade

```text
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
```

## Imports / Tools

```text
tools/loyalty_import_streamelements_points.js
data/imports/streamelements_points_top489_2026-06-15.csv
data/imports/streamelements_points_top489_excluded_2026-06-15.csv
data/imports/streamelements_points_raw_top489_2026-06-15.tsv
data/imports/README_streamelements_points_import_2026-06-15.md
```

## Relevante STEP-ZIPs aus diesem Arbeitsstand

```text
STEP_LC_POINTS_IMPORT_STREAMELEMENTS_2026-06-15.zip
STEP_LC_RAFFLE_1_SIMPLE_RAFFLE_2026-06-15.zip
STEP_LC_RAFFLE_1B_CHAT_MESSAGES_2026-06-15.zip
STEP_LC_RAFFLE_1C_LOYALTY_PAYOUT_2026-06-15.zip
STEP_LC_RAFFLE_1D_CHAT_TEXT_CLEANUP_2026-06-15.zip
STEP_LC_RAFFLE_1E_JOIN_TEXT_CLEANUP_2026-06-15.zip
STEP_LC_RAFFLE_1F_PUBLIC_TEXT_KEYS_2026-06-15.zip
STEP_LC_RAFFLE_2A_CONFIG_ROUTES_2026-06-15.zip
STEP_LC_RAFFLE_2A_FIX1_CONFIG_ENDPOINT_2026-06-15.zip
STEP_LC_MINIGAMES_1B_DASHBOARD_TAB_2026-06-15.zip
STEP_LC_MINIGAMES_1C_DASHBOARD_LAYOUT_CLEANUP_2026-06-15.zip
STEP_LC_MINIGAMES_1C_DASHBOARD_LAYOUT_CLEANUP_FULLPATH_2026-06-15.zip
STEP_LC_MINIGAMES_1D_RAFFLE_DETAIL_LAYOUT_2026-06-15.zip
STEP_LC_MINIGAMES_1D_RAFFLE_DETAIL_LAYOUT_FULLPATH_2026-06-15.zip
```

## Doku / Übergabe

```text
docs/current/CURRENT_CHAT_HANDOFF_LC_MINIGAMES_RAFFLE_DASHBOARD_2026-06-15.md
docs/modules/loyalty.md
docs/modules/loyalty_giveaways.md
docs/modules/loyalty_games_dashboard.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
NEXT_CHAT_PROMPT_LC_MINIGAMES_RAFFLE_DASHBOARD_2026-06-15.md
```

## STEP_HT1_FIX2_HYPETRAIN_MEDIA_STATE_SAVE

Geaendert:

```text
htdocs/dashboard/modules/twitch_events.js
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
```


## STEP_HT1_FIX3_HYPETRAIN_DASHBOARD_RENDER_FIX
- `htdocs/dashboard/modules/twitch_events.js` - Renderfix für Hype-Train-Rekord-Tab.

## STEP_HT2_4_HYPETRAIN_DASHBOARD_END_ACTION_CONTROLS

Geänderte Dateien:

- `htdocs/dashboard/modules/hypetrain.js`
- `htdocs/dashboard/modules/hypetrain.css`
- `docs/modules/hypetrain.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`


## HypeTrain HT2.5 relevante Dateien

- `backend/modules/hypetrain.js` - Backend 0.1.3 mit Live-Readiness-Route.
- `htdocs/dashboard/modules/hypetrain.js` - Dashboard-Button fuer Live-Readiness.
- `htdocs/dashboard/modules/hypetrain.css` - kleine Statusdarstellung fuer Readiness.
- `docs/modules/hypetrain.md` - Modul-Doku HT2.5.

## HT2.6 geänderte Dateien

- `backend/modules/hypetrain.js` – Aktivierungsprofile und Routen `GET/POST /api/hypetrain/activation-profiles`.
- `htdocs/dashboard/modules/hypetrain.js` – Dashboard-Anzeige und Buttons für Aktivierungsprofile.
- `htdocs/dashboard/modules/hypetrain.css` – Styling für Aktivierungsprofile.
- `docs/modules/hypetrain.md` – Dokumentation der HT2.6-Profile und Schutzregeln.
- `project-state/*.md` – Projektstand, nächste Schritte, TODO und Changelog aktualisiert.
