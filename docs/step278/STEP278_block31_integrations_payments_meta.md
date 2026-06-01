# STEP278 Block 31 – Integrationen/Payments/Clips/VIP/TTS MODULE_META

## Ziel

Block 31 ergänzt nur Loader-/Diagnose-Metadaten für Integrations-, Payment-, Clip-, VIP- und TTS-Module.

## Betroffene Dateien

- `backend/modules/discord.js`
- `backend/modules/kofi.js`
- `backend/modules/tipeee.js`
- `backend/modules/tts_system.js`
- `backend/modules/vip_sound_overlay.js`
- `backend/modules/clips.js`

## Änderungen

- `MODULE_META`
- `MODULE_VERSION`
- `version`
- `type: "runtime"`
- Kategorie/Route-Prefix/Bus-Metadaten für `/api/_status`

## Nicht geändert

- Keine Routenänderung
- Keine Discord-/Payment-/Clip-/VIP-/TTS-Logikänderung
- Keine DB-Migration
- Keine Queue-/Overlay-/Sound-Änderung
- Keine neue Bus-/Heartbeat-Implementierung
- Kein Loader-Umbau

## Test

```powershell
node --check backend\modules\discord.js
node --check backend\modules\kofi.js
node --check backend\modules	ipeee.js
node --check backend\modules	ts_system.js
node --check backend\modulesip_sound_overlay.js
node --check backend\modules\clips.js
```
