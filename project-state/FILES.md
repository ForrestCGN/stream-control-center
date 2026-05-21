# FILES - stream-control-center

Stand: 2026-05-21

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

Nicht geaendert:

```text
app.sqlite
config/**
Streamer.bot-Flows
Overlay-HTML
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
```

Hinweis:

```text
sound_system.js enthaelt die zentrale Discord-Ausgabe und Auto-Routing-Logik.
vip_sound_overlay.js enthaelt die Korrektur fuer echte VIP-/Mod-Sounds, die vorher hart target=stream setzten.
```

## Relevante Module

```text
backend/modules/sound_system.js
backend/modules/discord.js
backend/modules/vip_sound_overlay.js
backend/modules/alert_system.js
backend/modules/soundalerts_bridge.js
backend/modules/tts_system.js
```
