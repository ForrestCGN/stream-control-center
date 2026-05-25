# CURRENT_SYSTEM_STATUS

Aktueller Stand: STEP456_SOUND_SYSTEM_BUS_FIRST_TEST_SWITCH

## Systeme
- VIP: produktiv ueber Node-Command-System + Sound-Bus.
- Alerts: Bus-First mit Legacy-Fallback.
- Sound-System: testweise Bus-First fuer Sound-/Overlay-Ereignisse, Legacy-WebSocket als Fallback.

## Sound-System
- Modulversion: `0.1.18`
- `soundBus.mode`: `bus_first`
- `soundBus.legacyFallback`: `true`
- Device, Discord, TTS, Queue, Priority, Bundle und Lock bleiben unveraendert.
