# CHANGELOG

## STEP429
- `backend/modules/vip_sound_overlay.js` auf Version `1.8.13` aktualisiert.
- Neue Route `/api/vip-sound/eventbus/sound-command/dry-run` ergänzt.
- VIP erzeugt einen Shadow-Command und validiert denselben Payload gegen `/api/sound/eventbus/command/dry-run`.
- Dry-Run-Statistiken ergänzt: `dryRunChecks`, `dryRunOk`, `dryRunFailed`, `lastDryRun`.
- Schutzflags bleiben aktiv: kein Queue-Touch, kein Audio-Touch, kein Overlay-Touch, kein Daily-Usage-Touch.
