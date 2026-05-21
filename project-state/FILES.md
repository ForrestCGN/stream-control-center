# FILES - stream-control-center

## STEP272D1 - Sound-Pegel Defaults vollständig auf 80

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272D1_SOUND_PEGEL_DEFAULTS_COMPLETE.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
backend/modules/vip_sound_overlay.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
Sound-Dateien
config/**
Alert-Regeln massenhaft
SoundAlert-Entries massenhaft
Sound-Queue
Discord-Routing
TTS-System
```

# FILES - stream-control-center

## STEP272D - Sound-Pegel Upload-/Playback-Defaults anwenden

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
backend/modules/vip_sound_overlay.js
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272D_SOUND_PEGEL_UPLOAD_DEFAULTS_APPLY.md
```

Nicht geaendert:

```text
Sound-Dateien
config/**
Alert-Regeln massenhaft
SoundAlert-Entries massenhaft
Sound-Queue
Discord-Routing
TTS-System
```


Stand: 2026-05-21

## STEP272B3 - Sound-Pegel Referenz-Ausgabeweg waehlbar

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272B3_SOUND_PEGEL_REFERENZ_AUSGABEWEG.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
app.sqlite
config/**
Sound-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
```

# FILES - stream-control-center

Stand: 2026-05-21


## STEP272B2 - Sound-Pegel Testton als echte Sound-Datei

Geaendert:

```text
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272B2_SOUND_PEGEL_TESTTON_ECHTE_DATEI.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
app.sqlite ersetzt/neu gebaut: nein
config/**
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
Streamer.bot-Flows
Overlay-HTML
```

Runtime-Hinweis:

```text
Bei Nutzung des Test-Ton-Buttons kann htdocs/assets/sounds/generated/reference_test.wav erzeugt/aktualisiert werden.
```

## STEP272B1 - Sound-Pegel Test-Ton ueber OBS/Sound-System

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
project-state/STEP272B1_SOUND_PEGEL_TESTTON_OBS.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
app.sqlite
config/**
Sound-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
```

# FILES - stream-control-center

Stand: 2026-05-21

## STEP272B - Sound-Pegel Auto-Referenz + Referenzsound

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
project-state/STEP272B_SOUND_PEGEL_AUTO_REFERENZ.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
app.sqlite ersetzt/neu gebaut: nein
config/**
Sound-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
```

# FILES - stream-control-center

Stand: 2026-05-21

## STEP272A - Sound-Pegel Unterbereiche/Tabs

Geaendert:

```text
htdocs/dashboard/modules/sound_levelscan.js
htdocs/dashboard/modules/sound_levelscan.css
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP272A_SOUND_PEGEL_UNTERBEREICHE_TABS.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
app.sqlite
config/**
Sound-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
```

## STEP271 - Sound-Pegel eigenes Dashboard-Modul

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
project-state/STEP271_SOUND_PEGEL_EIGENES_DASHBOARD_MODUL.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
app.sqlite
config/**
Alert-/TTS-/Discord-Playback
Sound-Dateien
```

Hinweis:

```text
Sound-Pegel ist jetzt eigenes Dashboard-Modul `sound_level`, nutzt aber weiterhin die vorhandenen Backend-Routen `/api/sound/loudness/*`.
```


## STEP270G1 - Pegel-Playback-Korrektur Safe-Tuning

Geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270G1_SOUND_PEGEL_PLAYBACK_CORRECTION_SAFE_TUNING.md
```

Nicht geaendert:

```text
Sound-Dateien
config/**
Sound-System Queue-/Bundle-/Discord-Logik
Alert-System
TTS-System
Streamer.bot-Flows
Overlay-HTML
```


## STEP270G - Pegel-Playback-Korrektur optional

Geaendert:

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
htdocs/dashboard/modules/sound_levelscan.js
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEP270G_SOUND_PEGEL_PLAYBACK_CORRECTION_OPTIONAL.md
```

Nicht geaendert:

```text
Sound-Dateien
Normalisierte Kopien
config/**
app.sqlite neu gebaut/ersetzt: nein
Alert-System
TTS-System
Discord-Routing
Streamer.bot-Flows
Overlay-HTML
```

Hinweis:

```text
Die Pegel-Korrektur greift nur, wenn sie im Dashboard explizit aktiviert wird. Originaldateien bleiben unveraendert.
```

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


## STEP272C - Sound-Pegel Config-Seite

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
project-state/STEP272C_SOUND_PEGEL_CONFIG_SEITE.md
```

Nicht geaendert:

```text
backend/modules/sound_system.js
app.sqlite ersetzt/neu gebaut: nein
config/**
Sound-Dateien
Alert-/VIP-/SoundAlert-Daten
Sound-Queue
Discord-Routing
TTS-System
```


## STEP272E - Sound-Pegel bestehende Volume-Preview
- Neue Read-only API `GET /api/sound/loudness/config/mass-volume-preview`.
- Dashboard `System -> Sound-Pegel -> Config` zeigt eine Volume-Preview fuer bestehende Alert-/SoundAlert-/VIP-Daten.
- Pegel-Scan-Bewertung markiert Kandidaten fuer Boost-Kopie oder Runtime-Absenkung.
- Keine Massenänderung, keine Sounddatei-Änderung, keine config/**-Änderung.
