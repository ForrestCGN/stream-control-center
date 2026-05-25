# STEP446 – VIP Productive Switch Config/Status

## Ziel

Den vorbereiteten VIP Bus-First Productive-Switch `vipBusFirstProductiveEnabled` sauber als Config-/Statuswert sichtbar machen, ohne den normalen Chat-Command umzuschalten.

## Betroffene Dateien

- `backend/modules/vip_sound_overlay.js`
- `backend/modules/sound_system.js` (unverändert enthalten)
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderungen

- VIP-Modul-Version auf `1.8.28` erhöht.
- Feature auf `vip_bus_first_productive_switch_config_status` gesetzt.
- Productive-Switch-Status um Quelle, Rohwert, Default und Effective-Reason erweitert.
- Guard-/Status-Ausgaben zeigen jetzt u. a.:
  - `productiveSwitchSettingKey`
  - `productiveSwitchConfiguredSource`
  - `productiveSwitchConfiguredValue`
  - `productiveSwitchDefaultEnabled`
  - `productiveSwitchEffectiveReason`
  - `productiveSwitchSafetyLockReason`
  - `productiveSwitchConfigReadable`
  - `productiveSwitchStatusReadable`
  - `productiveSwitchConfigPath`
  - `productiveSwitchSettingsTable`

## Sicherheitsentscheidung

In STEP446 bleibt der Schalter effektiv gesperrt:

- `productiveSwitchEffectiveEnabled: false`
- `productiveSwitchSafetyLocked: true`
- `productiveEntryPointChanged: false`
- `productiveVipFlow: legacy_sound_system_api`

Auch wenn später testweise `vipBusFirstProductiveEnabled=true` gesetzt wird, wird dadurch in STEP446 kein normaler Chat-Command auf Bus-First umgestellt.

## Nicht geändert

- Kein produktiver Bus-Default.
- Kein normaler Twitch-Command-Umbau.
- Kein DailyUsage-Umbau.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Änderung an Legacy `/api/sound/play`.

## Test

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status"
$s | Select-Object version,feature,productiveSwitchAvailable,productiveSwitchSettingKey,productiveSwitchConfiguredSource,productiveSwitchConfiguredValue,productiveSwitchConfiguredEnabled,productiveSwitchEffectiveEnabled,productiveSwitchEffectiveReason,productiveSwitchSafetyLocked,productiveSwitchConfigReadable,productiveSwitchStatusReadable,productiveEntryPointChanged,productiveVipFlow
```
