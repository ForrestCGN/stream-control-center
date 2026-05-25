# Current System Status

## Aktueller Stand
STEP443 – VIP Bus-First optionaler Admin-Test ohne Legacy-Fallback ist vorbereitet.

## Relevante Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.26`
- `backend/modules/sound_system.js`: `0.1.19`
- Feature: `vip_bus_first_no_legacy_admin_test`

## Stand VIP Bus-First
Der normale VIP-Produktivfluss bleibt weiterhin auf `legacy_sound_system_api`.

Der explizite Admin-Testpfad kann mit `busFirstTest=true`, `vipBusMode=bus_enabled`, `forceAccess=true`, `consumeDaily=false`, `useExistingSound=true` und optional `noLegacyFallback=true` den Bus-First-Play-Test ausführen, ohne anschließend oder ersatzweise auf den Legacy-Queue-Pfad zurückzufallen.

STEP443 ergänzt dafür klare Diagnosefelder:
- `noLegacyFallback`
- `busFirstOnly`
- `legacyFallbackAllowed`
- `legacyFallbackUsed`
- erweiterte `soundBusCommand`-Auswertung mit `accepted`, `playedOrQueued`, `started`, `queued`, `queueTouched`, `audioTouched`, `normalizedSoundId`, `normalizedFile`

## Schutzregeln
- Kein produktiver Bus-Default.
- Kein normaler Twitch-Command-Umbau.
- Kein DailyUsage-Schreiben im Admin-Test mit `consumeDaily=false`.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Kein automatischer produktiver Bus-Verbrauch.
