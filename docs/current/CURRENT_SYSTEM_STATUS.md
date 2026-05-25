# CURRENT_SYSTEM_STATUS – VIP EventBus Delivery Classification

Stand: STEP410 vorbereitet.

## Aktueller VIP-/EventBus-Stand

Das VIP-/Mod-Sound-System sendet zusätzliche Status-Events an den Communication Bus auf dem Channel `vip.sound`.

Der produktive Sound-Ablauf bleibt unverändert:

```text
/api/vip-sound/command
→ vip_sound_overlay.js
→ /api/sound/play
→ Sound-System spielt Sound
→ VIP-Overlay reagiert weiterhin auf Sound-System-Status
```

## Neuer Stand in Version 1.8.11

Die VIP-EventBus-Status-Events werden nicht mehr breit an alle Bus-Clients verteilt.

Stattdessen ist die Delivery jetzt modulbezogen klassifiziert:

```text
channel: vip.sound
target.type: all
target.id: *
target.module: vip_sound_overlay
target.capability: ""
deliveryClassification: module_scoped_status_event
```

Dadurch sollen fremde Clients wie Alert-Shadow-/Debug-Overlays keine `vip.sound`-Status-Events mehr in `deliveredTo` erhalten.

## Unverändert

- Sound-System bleibt zuständig für Playback und Queue.
- EventBus-Events sind Status-/Diagnose-Events.
- EventBus ersetzt nicht `/api/sound/play`.
- Kein Overlay-Design wurde geändert.
- Keine Daily-Usage-Logik wurde geändert.
- Keine DB-Migration wurde durchgeführt.

## STEP411 - VIP Overlay Client Versioned Bus Registration

- `htdocs/overlays/vip_sound_overlay_v2.html` nutzt jetzt Version/Capabilities statt STEP-/Shadow-Kennungen.
- VIP-Overlay-Client registriert sich am Communication Bus mit `version: 1.0.0`, `mode: preview` und Capability `vip.sound.status_events`.
- Sound-System-Flow, Queue, Daily-Usage und Overlay-Design bleiben unverändert.
