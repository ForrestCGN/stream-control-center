# Current System Status

## Aktueller Stand
STEP447 – VIP Bus-First Cleanup & Konsolidierung.

## Relevante Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.29`
- `backend/modules/sound_system.js`: `0.1.19`
- Feature: `vip_bus_first_cleanup_consolidation`

## Ziel von STEP447
STEP447 stoppt den Ausbau weiterer Testpfade und konsolidiert den bestehenden VIP Bus-First-Kandidatenstatus. Der bestätigte Admin-Testpfad aus STEP443 bleibt erhalten, aber die Statusausgabe bekommt eine klare Zusammenfassung, damit die nächsten Entscheidungen nicht in immer mehr Einzelparametern untergehen.

## Konsolidierter Kandidat
Bestätigter Kandidat bleibt:

```text
VIP Admin-Test
→ vipBusMode=bus_enabled
→ busFirstTest=true
→ noLegacyFallback=true
→ direkte VIP-Datei
→ Sound-System Play-Test
→ kein Legacy-Fallback
→ kein DailyUsage
```

## Sicherheitsstatus
- Normaler Chat-Command bleibt unverändert.
- Produktiver VIP-Flow bleibt `legacy_sound_system_api`.
- `vipBusFirstProductiveEnabled` bleibt sichtbar, aber effektiv deaktiviert.
- `productiveSwitchSafetyLocked` bleibt `true`.
- `productiveEntryPointChanged` bleibt `false`.
- Keine neue Test-Route wurde hinzugefügt.

## Neue Konsolidierungsfelder
`/api/vip-sound/eventbus/sound-command/status` zeigt zusätzlich:

- `feature: vip_bus_first_cleanup_consolidation`
- `cleanupConsolidated: true`
- `cleanupProfile: candidate_status_only`
- `consolidatedBusFirstStatus.profile: cleanup_consolidated`
- `consolidatedBusFirstStatus.productivePath: legacy_sound_system_api`
- `consolidatedBusFirstStatus.candidatePath: sound_system_play_test`
- `consolidatedBusFirstStatus.normalChatCommandUsesBusFirst: false`
- `consolidatedBusFirstStatus.productiveSwitchSafetyLocked: true`
- `productiveSwitchSettingReadable: true`
- `productiveSwitchConfigFileReadable` getrennt von `productiveSwitchConfigReadable`

## Aufräumentscheidung
Ab STEP447 sollen keine weiteren parallelen Testpfade ergänzt werden. Der nächste sinnvolle Schritt ist entweder:

1. Produktiv-Umschaltung sauber und konfigurierbar vorbereiten, oder
2. alte Diagnosefelder nach bewusster Freigabe entfernen.
