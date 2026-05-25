# CURRENT_STATUS – STEP406 VIP EventBus Status Diagnostics

Aktueller Stand: STEP406 vorbereitet.

## Fokus

VIP-System wird schrittweise an den Communication/EventBus angebunden.

STEP405 hat Status-Events auf `vip.sound` ergänzt.
STEP406 macht diese Status-Events über eigene Diagnose-Routen sichtbar und prüfbar.

## Produktiver Flow bleibt unverändert

```text
/api/vip-sound/command
→ vip_sound_overlay.js
→ /api/sound/play
→ Sound-System Queue/Playback
→ VIP-Overlay reagiert auf sound_system WS + /api/sound/status
```

## EventBus-Zusatz

```text
vip_sound_overlay.js
→ Communication Bus
→ channel: vip.sound
→ Status-Events accepted / duplicate / denied / sound_missing / error usw.
```

Diese Events starten keinen Sound und steuern kein Overlay.

## Neue Routen

```text
/api/vip-sound/eventbus/status
/api/vip-sound/eventbus/reset
/api/vip-sound-overlay/eventbus/status
/api/vip-sound-overlay/eventbus/reset
```

## Wichtig

Keine Patches verwenden. ZIP enthält vollständige Zielpfade und eine vollständige Ersatzdatei.
