# Current System Status

## Aktueller Stand
STEP445 – VIP Bus-First Produktiv-Schalter vorbereitet, aber sicherheitsgesperrt.

## Relevante Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.27`
- `backend/modules/sound_system.js`: `0.1.19`
- Feature: `vip_bus_first_productive_switch_prepared`

## Ziel von STEP445
Der in STEP443/STEP444 bestätigte Bus-First-Admin-Testpfad bleibt stabiler Kandidat. STEP445 ergänzt nur eine vorbereitete, dashboard-/configfähige Schalterstruktur für eine spätere Produktiv-Umschaltung.

## Neuer vorbereiteter Schalter
- Setting-Key: `vipBusFirstProductiveEnabled`
- Default: `false`
- Effektiv in STEP445: immer `false`
- Sicherheitsstatus: `safetyLocked: true`
- Normaler Chat-Command: weiterhin kein Bus-First-Produktivpfad
- Produktiver Entry-Point: weiterhin `legacy_sound_system_api`

## Erwartete Statusfelder
`/api/vip-sound/eventbus/sound-command/status` zeigt u. a.:

- `productiveSwitchAvailable: true`
- `productiveSwitchConfiguredEnabled: false` im Default
- `productiveSwitchEffectiveEnabled: false`
- `productiveSwitchSafetyLocked: true`
- `productiveEntryPointChanged: false`
- `productiveVipFlow: legacy_sound_system_api`

## Unverändert bestätigter Admin-Test-Kandidat
Der explizite Admin-Testpfad bleibt möglich mit:

- `forceAccess=true`
- `consumeDaily=false`
- `useExistingSound=true`
- `vipBusMode=bus_enabled`
- `busFirstTest=true`
- `noLegacyFallback=true`

Dabei gilt weiterhin:

- direkte VIP-Datei, z. B. `vip/adoredpenny.mp3`
- Sound-System Play-Test
- kein Legacy-Fallback im Admin-Test
- kein DailyUsage
- normaler Chat-Command unverändert

## Schutzregeln
- Kein produktiver Bus-Default.
- Keine automatische Produktiv-Umschaltung.
- Schalter ist vorbereitet, aber effektiv gesperrt.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Änderung an `backend/modules/sound_system.js` gegenüber STEP442/STEP443.
