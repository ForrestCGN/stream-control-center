# NEXT_STEPS

## Direkt nach STEP445

1. Syntax prüfen:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js
```

2. Status kurz prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status"
$s | Select-Object version,feature,productiveSwitchAvailable,productiveSwitchConfiguredEnabled,productiveSwitchEffectiveEnabled,productiveSwitchSafetyLocked,productiveEntryPointChanged,productiveVipFlow
```

Erwartung im Default:

- `version: 1.8.27`
- `feature: vip_bus_first_productive_switch_prepared`
- `productiveSwitchAvailable: True`
- `productiveSwitchConfiguredEnabled: False`
- `productiveSwitchEffectiveEnabled: False`
- `productiveSwitchSafetyLocked: True`
- `productiveEntryPointChanged: False`
- `productiveVipFlow: legacy_sound_system_api`

3. STEP445 abschließen:

```powershell
.\stepdone.cmd "STEP445 VIP Bus-First Productive Switch Prepared"
```

## Danach möglich

### STEP446 – Produktiv-Schalter Testmodus/Dry-Run validieren

Ziel: Prüfen, ob ein gesetzter `vipBusFirstProductiveEnabled=true` im Status sichtbar wird, aber weiterhin durch `safetyLocked=true` keine Produktiv-Umschaltung auslöst.

### Späterer Schritt – echte Produktiv-Umschaltung

Erst nach separatem Live-Test und ausdrücklicher Freigabe darf der normale VIP-Chat-Command optional auf Bus-First umgestellt werden.
