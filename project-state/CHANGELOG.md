# CHANGELOG

## STEP412 – Sound-System EventBus Baseline

- `backend/modules/sound_system.js` auf Version `0.1.13` vorbereitet.
- `soundBus.enabled` als parallele EventBus-Ausgabe aktiviert.
- Sound-System Runtime-Ausgabe von STEP-Kennung auf Versions-/Capability-Felder umgestellt.
- Neue Sound-EventBus-Routen ergänzt:
  - `/api/sound/eventbus/status`
  - `/api/sound/eventbus/test`
  - `/api/sound/eventbus/reset`
- `sound.test` Smoke-Test ergänzt, ohne Sound, Queue oder Playback zu berühren.
- Alte `/api/sound/*` Routen bleiben unverändert.
- Alter `sound_system` WebSocket bleibt unverändert.
- Keine Queue-, Prioritäts-, Bundle-, Alert-, VIP-, DB- oder Overlay-Designänderung.

## Vorherige relevante Stände

- STEP411: VIP-Overlay-Client nutzt versionierte Bus-Registrierung.
- STEP410: VIP EventBus Delivery auf `vip_sound_overlay` klassifiziert.
- STEP409: VIP EventBus Status auf Version/Capability umgestellt.
- STEP405–408: VIP sendet Status-Events auf `vip.sound` und wurde mit echten Mod-/Override-Flows getestet.
