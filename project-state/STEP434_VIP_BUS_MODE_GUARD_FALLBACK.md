# STEP434 – VIP Bus-Modus Guard/Fallback vorbereiten

## Ziel
Der vorbereitete VIP Bus-Modus bekommt eine sichtbare Guard-/Fallback-Schicht, ohne den produktiven VIP-Sound-Flow umzuschalten.

## Betroffene Dateien
- `backend/modules/vip_sound_overlay.js`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderung
- Modulversion auf `1.8.17` erhöht.
- Feature auf `vip_sound_bus_mode_guard_fallback_preparation` geändert.
- Neue Guard-/Fallback-Funktion für VIP Bus-Modi ergänzt.
- Neue Route ergänzt:
  - `/api/vip-sound/eventbus/sound-command/guard`
  - Alias über `/api/vip-sound-overlay/eventbus/sound-command/guard`
- Sound-Command-Status enthält jetzt u. a.:
  - `busModeGuard`
  - `guardActive`
  - `fallbackVipBusMode`
  - `fallbackReason`
  - `productiveBusAllowed`
  - `productiveBusBlocked`
- `bus_enabled` bleibt auswählbar, wird aber als vorbereitet/blocked ausgewiesen und fällt effektiv auf `legacy_sound_system_api` zurück.

## Bewusst nicht geändert
- Kein produktiver VIP-Bus-Flow.
- `effectiveVipFlow` bleibt `legacy_sound_system_api`.
- `bus_enabled` bleibt vorbereitet, aber nicht produktiv aktiv.
- Keine Sound-Queue-Änderung.
- Keine produktive Audio-Änderung.
- Keine Overlay-Steuerung.
- Keine Daily-Usage-Änderung.
- Keine DB-Migration.

## Erwartete Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/mode?mode=bus_enabled" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/guard?mode=bus_enabled" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/mode?mode=shadow" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
```

## Erwartung
- `version: 1.8.17`
- `feature: vip_sound_bus_mode_guard_fallback_preparation`
- `allowedVipBusModes: legacy, shadow, play_test, bus_enabled`
- Nach `mode?mode=bus_enabled`: `vipBusMode: bus_enabled`
- Danach im Status: `vipBusMode: bus_enabled`
- `busModeGuard.guardActive: true`
- `busModeGuard.productiveBusAllowed: false`
- `busModeGuard.productiveBusBlocked: true`
- `busModeGuard.fallbackVipBusMode: legacy`
- `busModeGuard.effectiveVipFlow: legacy_sound_system_api`
- `effectiveVipFlow: legacy_sound_system_api`
- `productiveEntryPointChanged: false`
- `queueTouched: false`
- `audioTouched: false`
- `dailyUsageTouched: false`

## Reset-Verhalten
`/eventbus/sound-command/reset` setzt Diagnosezähler zurück und stellt den Runtime-Modus wieder auf `legacy`.
