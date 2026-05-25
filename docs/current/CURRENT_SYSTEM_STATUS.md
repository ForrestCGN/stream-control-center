# Current System Status

## Aktueller Stand
STEP442 – VIP Bus-First Testauswertung / Status Cleanup ist vorbereitet.

## Relevante Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.25`
- `backend/modules/sound_system.js`: `0.1.19`
- Feature: `vip_bus_first_status_cleanup`

## Stand VIP Bus-First
Der normale VIP-Produktivfluss bleibt weiterhin auf `legacy_sound_system_api`.

Der explizite Admin-Testpfad kann mit `busFirstTest=true`, `vipBusMode=bus_enabled`, `forceAccess=true`, `consumeDaily=false` und `useExistingSound=true` eine vorhandene VIP-Datei über den Sound-System-Play-Test prüfen.

STEP441 hat die direkte Datei-Auflösung repariert. STEP442 räumt die Diagnose auf, damit direkte Datei-Payloads im Sound-System-Command-Status mit einem sinnvollen `lastSoundId` sichtbar bleiben, z. B. `vip/adoredpenny.mp3`.

## Schutzregeln
- Kein produktiver Bus-Default.
- Kein normaler Twitch-Command-Umbau.
- Kein DailyUsage-Schreiben im Admin-Test mit `consumeDaily=false`.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
