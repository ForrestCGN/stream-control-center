# STEP435 – VIP Guard im echten VIP-Auslösepfad diagnostisch einhängen

## Ziel
Die vorbereitete VIP Bus-Guard-/Fallback-Entscheidung wird im echten VIP-Sound-Auslösepfad sichtbar gemacht, ohne den produktiven Flow umzuschalten.

## Betroffene Dateien
- `backend/modules/vip_sound_overlay.js`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderung
- Modulversion auf `1.8.18` erhöht.
- Feature auf `vip_sound_guard_real_flow_diagnostics` geändert.
- Beim echten VIP/Mod-Sound-Trigger wird vor der legacy Sound-System-Übergabe eine Guard-Diagnose gespeichert.
- Sound-command Status enthält jetzt:
  - `stats.realFlowChecks`
  - `stats.realFlowLegacyFallbacks`
  - `stats.lastRealFlowGuard`
- Accepted VIP Command Responses enthalten jetzt:
  - `vipBusMode`
  - `runtimeVipBusMode`
  - `effectiveVipFlow`
  - `effectiveSoundEntryPoint`
  - `busModeGuard`
  - `productiveEntryPointChanged`
- Das legacy Sound-System Payload-Meta enthält ebenfalls die Guard-Diagnose zur Nachverfolgung.

## Bewusst nicht geändert
- Kein produktiver VIP-Bus-Flow.
- `effectiveVipFlow` bleibt `legacy_sound_system_api`.
- `bus_enabled` bleibt vorbereitet, aber nicht produktiv aktiv.
- Keine Sound-Queue-Logik geändert.
- Keine produktive Audio-Logik geändert.
- Keine Overlay-Steuerung geändert.
- Keine Daily-Usage-Logik geändert.
- Keine DB-Migration.

## Erwartete Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/mode?mode=bus_enabled" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/test?login=forrestcgn&consumeDaily=false" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
```

Alternativ kann statt der Test-Route der echte Streamer.bot-/Chat-Trigger genutzt werden.

## Erwartung
- `version: 1.8.18`
- `feature: vip_sound_guard_real_flow_diagnostics`
- Nach einem akzeptierten VIP-Test steigt `stats.realFlowChecks`.
- `stats.lastRealFlowGuard.runtimeVipBusMode` zeigt den aktiven Modus, z. B. `bus_enabled`.
- `stats.lastRealFlowGuard.effectiveVipFlow` bleibt `legacy_sound_system_api`.
- `stats.lastRealFlowGuard.productiveBusAllowed` bleibt `false`.
- `stats.lastRealFlowGuard.productiveEntryPointChanged` bleibt `false`.
- `stats.lastRealFlowGuard.queueTouched` bleibt `false` für die Guard-Diagnose selbst.
- `stats.lastRealFlowGuard.audioTouched` bleibt `false` für die Guard-Diagnose selbst.
- `stats.lastRealFlowGuard.dailyUsageTouched` bleibt `false` für die Guard-Diagnose selbst.

## Hinweis
Die echte VIP-Funktion wird damit beobachtbar. Sie wird in STEP435 noch nicht auf produktiven Bus-Betrieb umgestellt.
