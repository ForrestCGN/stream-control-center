# CHANGELOG

## STEP444 – VIP Bus-First Admin-Test als stabiler Kandidat dokumentieren

- STEP443-Ergebnis als stabilen Admin-Test-Kandidaten dokumentiert.
- Keine Backend-Funktionsänderung.
- `backend/modules/vip_sound_overlay.js` bleibt auf `1.8.26`.
- `backend/modules/sound_system.js` bleibt auf `0.1.19`.
- Bestätigter Pfad:
  - Admin-Test
  - `bus_enabled`
  - `busFirstTest=true`
  - `noLegacyFallback=true`
  - direkte VIP-Datei `vip/adoredpenny.mp3`
  - Sound-System-Play-Test
  - kein Legacy-Fallback
  - kein DailyUsage
- Projektstatus und Next-Steps auf Kandidatenstand aktualisiert.
- Keine produktive Bus-Umschaltung.
- Keine DB-Migration.
- Kein Dashboard-Umbau.
