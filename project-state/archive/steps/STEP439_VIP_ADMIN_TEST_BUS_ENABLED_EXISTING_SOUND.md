# STEP439 – VIP Admin-Test bus_enabled + Existing Sound

## Ziel

Der VIP Admin-Test soll in einem einzigen Testlauf den Runtime-Modus `bus_enabled`, eine vorhandene VIP-Sounddatei und den echten Legacy-Sound-System-Pfad verbinden.

Damit wird geprüft, dass `bus_enabled` sichtbar aktiv ist, aber der Guard den produktiven VIP-Flow weiterhin auf `legacy_sound_system_api` hält.

## Betroffene Dateien

- `backend/modules/vip_sound_overlay.js`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/STEP439_VIP_ADMIN_TEST_BUS_ENABLED_EXISTING_SOUND.md`

## Änderung

`/api/vip-sound/test` kann nun im Admin-Test direkt einen Diagnose-Modus setzen:

- `vipBusMode`
- `testVipBusMode`
- `busMode`
- `mode`

Der Modus wird vor dem echten VIP-Testpfad in den Runtime-State übernommen und danach im Guard-Snapshot dokumentiert.

Zusätzliche Diagnosefelder:

- `adminTestVipBusModeRequested`
- `adminTestVipBusModeBefore`
- `adminTestVipBusModeApplied`
- `stats.lastRealFlowGuard.adminTestVipBusModeRequested`
- `stats.lastRealFlowGuard.adminTestVipBusModeApplied`

## Bewusst nicht geändert

- Kein produktiver VIP-Bus-Wechsel.
- Kein Entfernen der normalen Twitch-VIP-/Mod-Sperre.
- Kein DB-Umbau.
- Kein Dashboard-Umbau.
- Kein Umbau der Sound-Queue.
- Kein DailyUsage bei `consumeDaily=false`.
- `effectiveVipFlow` bleibt `legacy_sound_system_api`.

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/vip-sound/test" `
  -ContentType "application/json" `
  -Body '{"login":"forrestcgn","consumeDaily":false,"forceAccess":true,"useExistingSound":true,"vipBusMode":"bus_enabled"}' |
ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
```

## Erwartung

- `version: 1.8.22`
- `feature: vip_admin_test_bus_enabled_existing_sound`
- `accepted: true`
- `soundSystemQueued: true`
- `adminTestSoundOverride: true`
- `vipBusMode: bus_enabled`
- `runtimeVipBusMode: bus_enabled`
- `stats.lastRealFlowGuard.runtimeVipBusMode: bus_enabled`
- `stats.lastRealFlowGuard.effectiveVipFlow: legacy_sound_system_api`
- `stats.lastRealFlowGuard.productiveBusAllowed: false`
- `stats.lastRealFlowGuard.productiveBusBlocked: true`
- `stats.lastRealFlowGuard.productiveEntryPointChanged: false`
- `dailyUsageWritten: false`

## Status

Bereit zum Test.
