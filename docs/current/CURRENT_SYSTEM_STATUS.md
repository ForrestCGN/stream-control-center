# Current System Status

## Aktueller Stand
STEP444 – VIP Bus-First Admin-Test als stabiler Kandidat dokumentiert.

## Relevante Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.26`
- `backend/modules/sound_system.js`: `0.1.19`
- Feature: `vip_bus_first_no_legacy_admin_test`

## Geprüfter Kandidatenstand
STEP443 wurde nach Live-Test als stabiler Admin-Test-Kandidat bestätigt. Der explizite Admin-Testpfad kann mit:

- `forceAccess=true`
- `consumeDaily=false`
- `useExistingSound=true`
- `vipBusMode=bus_enabled`
- `busFirstTest=true`
- `noLegacyFallback=true`

einen VIP-Sound über den Bus-First-Play-Test ausführen, ohne Legacy-Fallback zu verwenden.

## Bestätigte Testsignale
- `accepted: True`
- `busFirstTestApplied: True`
- `noLegacyFallback: True`
- `busFirstOnly: True`
- `legacyFallbackAllowed: False`
- `legacyFallbackUsed: False`
- `legacyQueueSkippedForBusFirstTest: True`
- `soundBusCommand.ok: True`
- `playedOrQueued: True`
- `started: True`
- `normalizedFile: vip/adoredpenny.mp3`
- `dailyUsageWritten: False`
- Sound-System-Status: `playTestOk > 0`, `playTestFailed: 0`, `lastError` leer, `lastSoundId: vip/adoredpenny.mp3`

## Schutzregeln
- Kein produktiver Bus-Default.
- Kein normaler Twitch-Command-Umbau.
- Kein DailyUsage-Schreiben im Admin-Test mit `consumeDaily=false`.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Kein automatischer produktiver Bus-Verbrauch.
- STEP444 ist Dokumentation/Status, keine Funktionsänderung.
