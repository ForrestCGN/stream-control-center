# FILES - stream-control-center

Stand: 2026-05-21

## STEP270D1 - Pegel-Scan TTS-Dateien ausgeschlossen

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270D1_SOUND_PEGEL_SCAN_EXCLUDE_TTS.md
```

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
Alert-System
Discord-Routing
Sound-Dateien
```


## STEP270D - Pegel-Scan Korrektur-Vorschau

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270D_SOUND_PEGEL_SCAN_CORRECTION_PREVIEW.md
```

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
Alert-System
TTS
Discord-Routing
Sound-Dateien
```


## STEP270C - Pegel-Scan Dashboard UI verbessert

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270C_SOUND_PEGEL_SCAN_UI_EXPLANATIONS.md
```

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
Alert-System
TTS
Discord-Routing
Sound-Dateien
```

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

## STEP270E - Sound Pegel-Scan Fortschrittsanzeige

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270E_SOUND_PEGEL_SCAN_PROGRESS.md
```

Nicht geaendert:

```text
app.sqlite
config/**
backend/modules/sound_system.js
Alert-System
TTS-System
Discord-Routing
Sound-Dateien
```


## STEP270F - Pegel-Korrektur Vorschau-Einstellungen

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
project-state/STEP270F_SOUND_PEGEL_CORRECTION_SETTINGS_PREVIEW.md
```

Nicht geaendert:

```text
app.sqlite ersetzt/neu gebaut: nein
config/**
backend/modules/sound_system.js
Alert-/TTS-/Discord-Playback
Sound-Dateien
```
