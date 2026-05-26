# STEP436 – VIP Admin-Test Role-Bypass für Guard-Diagnose

## Ziel
`/api/vip-sound/test` kann mit `forceAccess=true` den echten VIP-Sound-Pfad diagnostisch erreichen, auch wenn der simulierte User nicht als Twitch-VIP/Mod erkannt wird.

Der normale Twitch-/Streamer.bot-Command bleibt weiterhin geschützt.

## Betroffene Dateien
- `backend/modules/vip_sound_overlay.js`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderung
- Modulversion auf `1.8.19` erhöht.
- Feature auf `vip_admin_test_guard_bypass` geändert.
- Admin-Test-Route unterstützt jetzt `forceAccess=true`.
- `forceAccess=true` wird nur über den Admin-Test-Ausführungspfad an `handleVipCommand` übergeben.
- Normale `/api/vip-sound/command` GET/POST-Aufrufe erhalten keinen Force-Access.
- Bei `consumeDaily=false` wird Daily-Usage im Admin-Test nicht geschrieben.
- Der echte Guard-/Fallback-Snapshot wird dadurch auch ohne echte Twitch-VIP/Mod-Rolle testbar.
- `stats.lastRealFlowGuard` enthält zusätzliche Diagnosefelder:
  - `adminTest`
  - `forceAccess`
  - `forceAccessApplied`
  - `adminTestDailyUsageBypassed`

## Bewusst nicht geändert
- Kein produktiver VIP-Bus-Flow.
- `effectiveVipFlow` bleibt `legacy_sound_system_api`.
- `bus_enabled` bleibt vorbereitet, aber nicht produktiv aktiv.
- Keine normale Twitch-Rollenprüfung entfernt.
- Keine Sound-Queue-Logik umgebaut.
- Keine produktive Audio-Logik umgebaut.
- Keine Overlay-Steuerung geändert.
- Keine DB-Migration.

## Erwartete Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/mode?mode=bus_enabled" | ConvertTo-Json -Depth 10
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/vip-sound/test" `
  -ContentType "application/json" `
  -Body '{"login":"forrestcgn","consumeDaily":false,"forceAccess":true}' |
ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
```

## Erwartung
- `version: 1.8.19`
- `feature: vip_admin_test_guard_bypass`
- Admin-Test-Response enthält `forceAccess: true`.
- Wenn der simulierte User nicht VIP/Mod ist, enthält die Response `forceAccessApplied: true`.
- `busModeGuard` ist nicht mehr `null`, sobald der echte Sound-Pfad erreicht wurde.
- `stats.realFlowChecks` steigt.
- `stats.lastRealFlowGuard.runtimeVipBusMode` zeigt den aktiven Modus, z. B. `bus_enabled`.
- `stats.lastRealFlowGuard.effectiveVipFlow` bleibt `legacy_sound_system_api`.
- `stats.lastRealFlowGuard.productiveBusAllowed` bleibt `false`.
- `stats.lastRealFlowGuard.productiveEntryPointChanged` bleibt `false`.
- Bei `consumeDaily=false` bleibt `dailyUsageWritten: false`.

## Hinweis
Dieser Bypass ist nur ein Admin-Test-Werkzeug. Er ist kein produktiver Berechtigungswechsel und kein Schritt zum automatischen Bus-Betrieb.
