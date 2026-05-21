# FILES - stream-control-center

Stand: 2026-05-21

## STEP270B - Sound Pegel-Scan Dashboard View

Geaendert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270B_SOUND_PEGEL_SCAN_DASHBOARD_VIEW.md
```

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
Streamer.bot-Flows
Overlay-HTML
```

Hinweis:

```text
Pegel-Scan ist nur Dashboard-Anzeige und API-Client fuer den bestehenden Read-only-Scanner.
Keine Datei-Normalisierung und keine Playback-Korrektur in diesem STEP.
```

## STEP270A/STEP270A1 - Sound Loudness Scanner Read-only

Relevante Dateien:

```text
backend/modules/sound_loudness_scanner.js
project-state/STEP270A_SOUND_LOUDNESS_SCANNER_READONLY.md
project-state/STEP270A1_SOUND_LOUDNESS_RESULTS_ROUTE_FIX.md
```

## STEP269A-C - Sound/Discord Integration

Geaendert:

```text
backend/modules/sound_system.js
backend/modules/vip_sound_overlay.js
project-state/STEP269A_SOUND_SYSTEM_DISCORD_TARGET_PLAYBACK.md
project-state/STEP269B_SOUND_SYSTEM_DISCORD_AUTO_ROUTING.md
project-state/STEP269C_VIP_SOUND_SYSTEM_TARGET_BOTH.md
```

Doku aktualisiert in STEP269D:

```text
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP269D_SOUND_DISCORD_INTEGRATION_CONFIRMED_2026-05-21.md
```

## Relevante Module

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
backend/modules/discord.js
backend/modules/vip_sound_overlay.js
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
```
