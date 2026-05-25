# CHANGELOG

## STEP410 – VIP EventBus Delivery Classification

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.11` erhöht.
- `vip.sound` Status-Events werden jetzt modulbezogen an `vip_sound_overlay` adressiert.
- `/api/vip-sound/eventbus/status` zeigt jetzt `target` und `deliveryClassification`.
- Ziel: fremde Clients wie Alert-Shadow-/Debug-Overlays sollen keine VIP-Status-Events mehr in `deliveredTo` erhalten.
- Keine Funktionsänderung an Sound-System, Queue, Daily-Usage, Overlay-Design oder DB-Schema.

## STEP409 – VIP EventBus Versioned Status Cleanup

- `backend/modules/vip_sound_overlay.js` auf Version `1.8.10` erhöht.
- VIP EventBus Statusausgabe von STEP-Kennung auf Versions-/Capability-Felder umgestellt.
- `step` aus `/api/vip-sound/eventbus/status` entfernt.
- `feature` durch `capability: vip.sound.status_events` und `statusApiVersion: 1.0.0` ersetzt.
- Alte STEP-Notizen im produktiven VIP-Command-Response neutralisiert.
- Keine Funktionsänderung an Sound-System, Queue, Daily-Usage, Overlay oder EventBus-Emission.

## STEP407 – VIP EventBus Smoke-Test Routes

- VIP EventBus Smoke-Test-Routen ergänzt.
- Test-Events auf `vip.sound` ohne Sound-System, Queue, Overlay oder Daily-Usage.

## STEP406 – VIP EventBus Status Diagnostics

- VIP EventBus Status- und Reset-Routen ergänzt.
- Integration-Check um EventBus-Status ergänzt.

## STEP405 – VIP EventBus Status Events

- VIP-/Mod-Sound-Command sendet zusätzliche Status-Events auf `vip.sound`.
- Bestehender Sound-System-Flow bleibt unverändert.
