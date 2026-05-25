# CURRENT_STATUS

Aktueller Stand: STEP456_SOUND_SYSTEM_BUS_FIRST_TEST_SWITCH

## Kurzstatus
- VIP laeuft produktiv ueber Node-Command-System + Sound-Bus.
- Alerts laufen Bus-First mit Legacy-Fallback.
- Sound-System ist jetzt testweise Bus-First fuer Sound-/Overlay-Ereignisse.
- Legacy-WebSocket bleibt als Fallback erhalten, wenn der Bus keinen Client erreicht.

## Geaendert in STEP456
- `backend/modules/sound_system.js` auf Version `0.1.18`.
- `soundBus.mode` Default: `bus_first`.
- `soundBus.legacyFallback` Default: `true`.
