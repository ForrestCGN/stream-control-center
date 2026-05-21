# STEP272D1 - Sound-Pegel Defaults vollständig auf 80

Stand: 2026-05-21

## Ziel

Nach STEP272D waren die Output-Defaults bereits auf 80 gesetzt, aber im Sound-System-Status standen noch alte Fallback-Werte auf 85:

```text
config.targets.stream.defaultVolume
config.targets.both.defaultVolume
config.defaults.volume
```

STEP272D1 erweitert `Defaults anwenden`, damit auch diese Sound-System-DB-Blöcke über `sound_settings` gesetzt werden.

## Geändert

```text
backend/modules/sound_loudness_scanner.js
```

Neue Apply-Default-Aktionen:

```text
sound_system_legacy_target_defaults -> sound_settings / targets
sound_system_fallback_default_volume -> sound_settings / defaults
```

## Wirkung

Nach `Defaults anwenden` und `/api/sound/reload` sollen diese Werte auf `defaultPlaybackVolume` stehen, aktuell 80:

```text
config.output.targets.overlay.defaultVolume
config.output.targets.device.defaultVolume
config.output.targets.both.defaultVolume
config.targets.stream.defaultVolume
config.targets.discord.defaultVolume
config.targets.both.defaultVolume
config.defaults.volume
```

## Nicht geändert

```text
Keine Sound-Dateien
Keine bestehenden Alert-Regeln
Keine bestehenden SoundAlert-Entries
Keine bestehenden VIP-/Mod-Einzelwerte
Keine Sound-Queue
Kein Discord-Routing
Kein TTS-System
Kein config/**
```

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\sound_loudness_scanner.js
.\stepdone.cmd "STEP272D1 Sound Pegel Defaults Complete"
```

Nach Deploy/Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/loudness/config/apply-defaults/preview" | ConvertTo-Json -Depth 80
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/loudness/config/apply-defaults" -Body "{}" -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/reload" -Body "{}" -ContentType "application/json" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 100
```
