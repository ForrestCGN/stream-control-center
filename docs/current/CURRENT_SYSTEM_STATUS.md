# CURRENT_SYSTEM_STATUS – VIP EventBus Versioned Status Cleanup

Stand: STEP409 vorbereitet.

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

## Neuer Stand in Version 1.8.10

Die Runtime-Statusausgabe der VIP-EventBus-Diagnose nutzt jetzt Versions-/Capability-Felder statt dauerhafter STEP-Kennungen:

```text
version: 1.8.10
capability: vip.sound.status_events
statusApiVersion: 1.0.0
```

Das alte `step`-Feld wurde aus der EventBus-Statusausgabe entfernt.

## Unverändert

- Sound-System bleibt zuständig für Playback und Queue.
- EventBus-Events sind Status-/Diagnose-Events.
- EventBus ersetzt nicht `/api/sound/play`.
- Kein Overlay-Design wurde geändert.
- Keine Daily-Usage-Logik wurde geändert.
- Keine DB-Migration wurde durchgeführt.
