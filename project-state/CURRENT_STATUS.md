# CURRENT_STATUS – STEP407 VIP EventBus Smoke-Test

Aktueller Stand: STEP407 vorbereitet.

## Fokus

VIP-System sendet zusätzliche Status-Events an den Communication/EventBus und ist jetzt ohne echten Sound testbar.

## Produktiver VIP-Pfad bleibt unverändert

```text
/api/vip-sound/command
→ vip_sound_overlay.js
→ /api/sound/play
→ Sound-System spielt VIP-/Mod-Sound
→ VIP-Overlay reagiert auf sound_system WS + /api/sound/status
```

## EventBus-Zusatzpfad

```text
vip_sound_overlay.js
→ vip.sound Status-Event
→ Communication/EventBus
```

## Neu in STEP407

- `GET/POST /api/vip-sound/eventbus/test`
- `GET/POST /api/vip-sound-overlay/eventbus/test`

Die Test-Routen senden nur ein Diagnose-Event und berühren weder Sound-System noch Overlay, Queue oder Daily-Usage.
