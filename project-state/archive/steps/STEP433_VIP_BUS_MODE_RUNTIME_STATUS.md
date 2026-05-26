# STEP433 – VIP Bus-Modus Status/Persistenz sauberziehen

## Ziel
Der vorbereitete VIP Bus-Modus muss nach einem Runtime-Wechsel sauber im Status sichtbar bleiben.

## Betroffene Dateien
- `backend/modules/vip_sound_overlay.js`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderung
- Modulversion auf `1.8.16` erhöht.
- Feature auf `vip_sound_bus_mode_runtime_status` geändert.
- `vipBusMode` im Sound-Command-Status liest jetzt den Runtime-State.
- DB/Config bleibt nur Initial-/Fallback-Quelle.
- Die Mode-Route setzt weiterhin nur Runtime-State.
- Die normale VIP `/status`-Route zeigt jetzt zusätzlich `vipBusMode` und den `soundBusCommand`-Statusblock.
- Der Sound-Command-Reset setzt den Runtime-Modus bewusst wieder auf `legacy`.

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
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/mode?mode=shadow" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/mode?mode=play_test" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
```

## Erwartung
- `version: 1.8.16`
- `feature: vip_sound_bus_mode_runtime_status`
- `allowedVipBusModes: legacy, shadow, play_test, bus_enabled`
- Nach `mode?mode=shadow`: `vipBusMode: shadow`
- Danach im Status: `vipBusMode: shadow`
- Nach `mode?mode=play_test`: `vipBusMode: play_test`
- Danach im Status: `vipBusMode: play_test`
- `effectiveVipFlow: legacy_sound_system_api`
- `productiveEntryPointChanged: false`
- `queueTouched: false`
- `audioTouched: false`
- `dailyUsageTouched: false`

## Reset-Verhalten
`/eventbus/sound-command/reset` setzt Diagnosezähler zurück und stellt den Runtime-Modus wieder auf `legacy`.
