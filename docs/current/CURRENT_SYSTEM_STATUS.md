# Current System Status – STEP429

STEP429 verbindet den VIP Sound-Bus Shadow-Command mit dem Sound-System Dry-Run-Consumer.

Der produktive VIP-Flow bleibt unverändert:

```text
VIP Command -> vip_sound_overlay -> /api/sound/play -> Sound-System
```

Neu ist nur die Diagnose-/Dry-Run-Prüfung:

```text
VIP Shadow Command -> sound.command Event -> Sound-System Dry-Run Validation
```

## Geändert

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.13` aktualisiert.
- Neue VIP-Diagnoseroute:
  - `/api/vip-sound/eventbus/sound-command/dry-run`
  - Alias über `/api/vip-sound-overlay/eventbus/sound-command/dry-run`
- Die Route erzeugt weiterhin ein test-only/shadow-only Bus-Command-Event und sendet denselben Payload anschließend an den Sound-System Dry-Run-Consumer.
- Der Sound-System Dry-Run validiert den Payload, startet aber keinen Sound und verändert keine Queue.

## Schutz

- Keine produktive VIP-Bus-Steuerung.
- Keine Sound-Queue über Bus.
- Kein Audio-Start über Bus.
- Keine Overlay-Steuerung.
- Keine DB-Migration.
- Alter VIP-/Sound-Flow bleibt unverändert.
