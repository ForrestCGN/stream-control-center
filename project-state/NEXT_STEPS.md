# NEXT_STEPS

## Direkt nach STEP447

1. Syntax prüfen:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js
```

2. Status kurz prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status"
$s | Select-Object version,feature,cleanupConsolidated,cleanupProfile,productiveSwitchAvailable,productiveSwitchConfiguredEnabled,productiveSwitchEffectiveEnabled,productiveSwitchSafetyLocked,productiveSwitchConfigReadable,productiveSwitchConfigFileReadable,productiveSwitchSettingReadable,productiveEntryPointChanged,productiveVipFlow
$s.consolidatedBusFirstStatus | Select-Object profile,step,productivePath,candidatePath,normalChatCommandUsesBusFirst,adminTestBusFirstCandidate,productiveSwitchEffective,productiveSwitchSafetyLocked,productiveEntryPointChanged,noLegacyFallbackOnlyInAdminTest
```

Erwartung:

- `version: 1.8.29`
- `feature: vip_bus_first_cleanup_consolidation`
- `cleanupConsolidated: True`
- `cleanupProfile: candidate_status_only`
- `productiveSwitchEffectiveEnabled: False`
- `productiveSwitchSafetyLocked: True`
- `productiveSwitchConfigReadable: True`
- `productiveEntryPointChanged: False`
- `productiveVipFlow: legacy_sound_system_api`
- `normalChatCommandUsesBusFirst: False`

3. STEP447 abschließen:

```powershell
.\stepdone.cmd "STEP447 VIP Bus-First Cleanup Consolidation"
```

## Danach möglich

### STEP448 – Entscheidungspunkt

Keine weiteren Testpfade bauen. Entscheiden:

1. Produktiv-Umschaltung als weiterhin standardmäßig deaktivierten echten Config-Schalter vorbereiten, oder
2. temporäre Diagnosefelder gezielt entfernen, sobald der Produktivpfad freigegeben ist.
