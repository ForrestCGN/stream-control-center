# STEP445 – VIP Bus-First Productive Switch Prepared

## Ziel

Den bestätigten VIP Bus-First Admin-Testpfad als Kandidat beibehalten und einen späteren Produktiv-Schalter vorbereiten, ohne den normalen Chat-Command umzuschalten.

## Betroffene Dateien

- `backend/modules/vip_sound_overlay.js`
- `backend/modules/sound_system.js` (unverändert enthalten)
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderungen

- VIP-Modul-Version auf `1.8.27` erhöht.
- Feature auf `vip_bus_first_productive_switch_prepared` gesetzt.
- Neues vorbereitendes Setting `vipBusFirstProductiveEnabled` ergänzt.
- Guard-/Status-Ausgaben um Produktiv-Schalter-Felder erweitert:
  - `productiveSwitch`
  - `productiveSwitchAvailable`
  - `productiveSwitchConfiguredEnabled`
  - `productiveSwitchEffectiveEnabled`
  - `productiveSwitchSafetyLocked`

## Sicherheitsentscheidung

In STEP445 bleibt der Schalter effektiv gesperrt:

- `productiveSwitchEffectiveEnabled: false`
- `productiveSwitchSafetyLocked: true`
- `productiveEntryPointChanged: false`
- `productiveVipFlow: legacy_sound_system_api`

Auch wenn die Config später testweise `vipBusFirstProductiveEnabled=true` enthält, wird dadurch in STEP445 kein normaler Chat-Command auf Bus-First umgestellt.

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
$s | Select-Object version,feature,productiveSwitchAvailable,productiveSwitchConfiguredEnabled,productiveSwitchEffectiveEnabled,productiveSwitchSafetyLocked,productiveEntryPointChanged,productiveVipFlow
```
