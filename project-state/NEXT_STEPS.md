# NEXT_STEPS

## Direkt nach STEP446

1. Syntax prüfen:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js
```

2. Status kurz prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status"
$s | Select-Object version,feature,productiveSwitchAvailable,productiveSwitchSettingKey,productiveSwitchConfiguredSource,productiveSwitchConfiguredValue,productiveSwitchConfiguredEnabled,productiveSwitchEffectiveEnabled,productiveSwitchEffectiveReason,productiveSwitchSafetyLocked,productiveSwitchConfigReadable,productiveSwitchStatusReadable,productiveEntryPointChanged,productiveVipFlow
```

Erwartung im Default:

- `version: 1.8.28`
- `feature: vip_bus_first_productive_switch_config_status`
- `productiveSwitchAvailable: True`
- `productiveSwitchSettingKey: vipBusFirstProductiveEnabled`
- `productiveSwitchConfiguredSource: database | config | default`
- `productiveSwitchConfiguredValue: False`
- `productiveSwitchConfiguredEnabled: False`
- `productiveSwitchEffectiveEnabled: False`
- `productiveSwitchEffectiveReason: configured_false`
- `productiveSwitchSafetyLocked: True`
- `productiveSwitchConfigReadable: True`
- `productiveSwitchStatusReadable: True`
- `productiveEntryPointChanged: False`
- `productiveVipFlow: legacy_sound_system_api`

3. STEP446 abschließen:

```powershell
.\stepdone.cmd "STEP446 VIP Productive Switch Config Status"
```

## Danach möglich

### STEP447 – Productive Switch True-Dry-Run validieren

Ziel: Testweise `vipBusFirstProductiveEnabled=true` setzen und bestätigen, dass der Status `configuredEnabled: true`, aber weiterhin `effectiveEnabled: false` und `safetyLocked: true` zeigt.

### Späterer Schritt – echte Produktiv-Umschaltung

Erst nach separatem Live-Test und ausdrücklicher Freigabe darf der normale VIP-Chat-Command optional auf Bus-First umgestellt werden.
