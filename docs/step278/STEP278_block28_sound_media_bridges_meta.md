# STEP278 Block 28 – Sound-/Media-Bridges MODULE_META

## Ziel

Sound-/Media-nahe Module erhalten loader-lesbare Metadaten (`MODULE_META`, Version und Runtime-Typ).

## Dateien

- `backend/modules/media.js`
- `backend/modules/sound_media_bridge.js`
- `backend/modules/video_media_bridge.js`
- `backend/modules/soundalerts_bridge.js`
- `backend/modules/sound_output_config.js`
- `backend/modules/sound_loudness_scanner.js`

## Scope

Nur Metadaten/Exports. Keine Routenänderung, keine Sound-Queue-Änderung, keine Media-Registry-Änderung, keine Upload-Logik, keine DB-Migration, keine Bus-/Heartbeat-Implementierung.
