# CHANGELOG

## STEP405 – VIP EventBus Status Events – 2026-05-25

### Added

- `backend/modules/vip_sound_overlay.js` sendet zusätzliche Status-Events an den Communication/EventBus.
- Neuer EventBus-Kanal: `vip.sound`.
- Neuer Runtime-Statusblock `eventBus` im VIP-Modul.
- Statusausgabe erweitert um EventBus-Zähler und letztes Event.
- EventBus-Emission in `finishVipCommand(...)`, sodass accepted, duplicate, denied, missing und error Fälle erfasst werden.

### Safety

- EventBus-Fehler sind nicht-destruktiv.
- VIP-Command, Chat-Ausgabe, Daily-Usage und Sound-System laufen weiter, auch wenn der Bus nicht verfügbar ist.

### Unchanged

- Kein Sound-System-Umbau.
- Keine Queue-Änderung.
- Keine Daily-Usage-Änderung.
- Keine sichtbare Overlay-Änderung.
- Keine `vip.overlay.show` Produktivumschaltung.
