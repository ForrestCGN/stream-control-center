# STEP401 - VIP Overlay Event Shadow Test

## Ziel

Nach STEP399/400 ist das VIP-Overlay als Communication-Bus-Client online. STEP401 ergänzt einen kontrollierten Shadow-Test für den Kanal `vip.overlay`.

## Wichtig

Dieser STEP ersetzt nicht den aktuellen VIP-Flow. Das VIP-Overlay rendert produktiv weiterhin über Sound-System-Events und `/api/sound/status`.

## Änderungen

### Overlay

`htdocs/overlays/vip_sound_overlay_v2.html`

- erkennt zusätzlich Communication-Bus-Envelopes mit `channel = vip.overlay`
- akzeptiert Actions `test`, `show`, `hide`, `update`
- bestätigt den Empfang per `bus_ack`
- zeigt im Debug `VIP BUS SHADOW EVENT`
- ruft im Shadow-Test ausdrücklich kein `showOverlay()` / `hideOverlay()` auf

### Backend

`backend/modules/communication_bus.js`

- neue Diagnose-Route: `/api/communication/test-vip-overlay`
- sendet `channel: vip.overlay`, `action: test`
- Ziel: `module: vip_sound_overlay`, capability `vip.overlay.test`
- `requireAck=true` und `replayable=true` per Default

## Erwartetes Ergebnis

- VIP-Bus-Client online
- Testevent wird an `vip_sound_overlay_v2` geliefert
- Overlay bestätigt per Ack
- Communication-Watchdog bleibt grün
- Sound-System bleibt unverändert/idle
