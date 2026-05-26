# STEP272D - Sound-Pegel Upload-/Playback-Defaults anwenden

Stand: 2026-05-21

## Ziel

Die in `System -> Sound-Pegel -> Config` gespeicherten Standardwerte sollen nicht nur gespeichert, sondern gezielt in die relevanten DB-Settings der Module übernommen werden können.

## Geändert

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
```

## Neue API

```text
GET  /api/sound/loudness/config/apply-defaults/preview
POST /api/sound/loudness/config/apply-defaults
```

## Was angewendet wird

- `sound_settings` / key `output`
  - setzt `targets.overlay.defaultVolume`
  - setzt `targets.device.defaultVolume`
  - setzt `targets.both.defaultVolume`
  - Wert aus `level_config.defaultPlaybackVolume`

- `soundalerts_bridge_settings` / key `soundSystem.defaultVolume`
  - Wert aus `level_config.uploadDefaultVolume`
  - wirkt auf neue/ungesetzte SoundAlerts/Kanalpunkte-Entries

- `vip_sound_settings` / key `soundSystemVolume`
  - Wert aus `level_config.uploadDefaultVolume`
  - VIP-/Mod-Sounds nutzen diesen Wert jetzt im Sound-System-Payload

## Dashboard

Im Tab `Sound-Pegel -> Config` gibt es jetzt:

```text
Preview laden
Defaults anwenden
```

Die Vorschau zeigt, welche DB-Settings geändert würden. `Defaults anwenden` schreibt nur diese DB-Settings.

## Nicht geändert

```text
Sound-Dateien
bestehende Alert-Regeln
bestehende SoundAlert-Entries
bestehende VIP-/Mod-Upload-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
config/**
app.sqlite ersetzt/neu gebaut: nein
```

## Hinweise

- Keine Massenaktion auf bestehende einzelne Sounds.
- Originaldateien werden nicht verändert.
- Nach dem Anwenden sollte das Backend oder mindestens Sound-System/SoundAlerts/VIP neu geladen werden.
