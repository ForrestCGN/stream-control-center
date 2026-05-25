# CHANGELOG

## STEP443 – VIP Bus-First optionaler Admin-Test ohne Legacy-Fallback

- VIP-Modul auf `1.8.26` erhöht.
- Feature auf `vip_bus_first_no_legacy_admin_test` gesetzt.
- `/api/vip-sound/test` akzeptiert im Admin-Test zusätzlich:
  - `noLegacyFallback`
  - `noLegacy`
  - `busFirstOnly`
  - `requireBusFirst`
  - `disableLegacyFallback`
- Bus-First-Testantwort enthält jetzt:
  - `noLegacyFallback`
  - `busFirstOnly`
  - `legacyFallbackAllowed`
  - `legacyFallbackUsed`
- Guard-Snapshot und RecentCommands enthalten die Legacy-Fallback-Diagnose.
- `soundBusCommand` im VIP-Test enthält mehr direkte Auswertungsfelder: `accepted`, `playedOrQueued`, `started`, `queued`, `queueTouched`, `audioTouched`, `normalizedSoundId`, `normalizedFile`.
- Sound-System bleibt auf `0.1.19`, keine funktionale Änderung dort.
- Keine produktive Bus-Umschaltung.
- Keine DB-Migration.
