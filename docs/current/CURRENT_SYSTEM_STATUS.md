# Current System Status

## Aktueller Stand
STEP446 – VIP Bus-First Productive Switch Config/Status vorbereitet.

## Relevante Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.28`
- `backend/modules/sound_system.js`: `0.1.19`
- Feature: `vip_bus_first_productive_switch_config_status`

## Ziel von STEP446
Der in STEP443/STEP444 bestätigte Bus-First-Admin-Testpfad bleibt stabiler Kandidat. STEP446 macht den vorbereiteten Produktiv-Schalter `vipBusFirstProductiveEnabled` sauber als Config-/Statuswert sichtbar, ohne den normalen Chat-Command umzuschalten.

## Productive Switch Config/Status
- Setting-Key: `vipBusFirstProductiveEnabled`
- Settings-Tabelle: `vip_sound_settings`
- Default: `false`
- Config-/DB-Quelle wird im Status ausgewiesen
- Effektiv in STEP446: immer `false`
- Sicherheitsstatus: `productiveSwitchSafetyLocked: true`
- Normaler Chat-Command: weiterhin kein Bus-First-Produktivpfad
- Produktiver Entry-Point: weiterhin `legacy_sound_system_api`

## Erwartete Statusfelder
`/api/vip-sound/eventbus/sound-command/status` zeigt u. a.:

- `productiveSwitchAvailable: true`
- `productiveSwitchSettingKey: vipBusFirstProductiveEnabled`
- `productiveSwitchConfiguredSource: database | config | default`
- `productiveSwitchConfiguredValue: false` im Default
- `productiveSwitchConfiguredEnabled: false` im Default
- `productiveSwitchEffectiveEnabled: false`
- `productiveSwitchEffectiveReason: configured_false` im Default
- `productiveSwitchSafetyLocked: true`
- `productiveSwitchConfigReadable: true`
- `productiveSwitchStatusReadable: true`
- `productiveEntryPointChanged: false`
- `productiveVipFlow: legacy_sound_system_api`

## Schutzregeln
- Kein produktiver Bus-Default.
- Keine automatische Produktiv-Umschaltung.
- Schalter ist lesbar vorbereitet, aber effektiv gesperrt.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Änderung an `backend/modules/sound_system.js` gegenüber STEP442/STEP443.
