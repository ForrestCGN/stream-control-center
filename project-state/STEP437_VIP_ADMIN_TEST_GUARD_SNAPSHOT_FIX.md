# STEP437 – VIP Admin-Test Guard Snapshot Fix

## Ziel
Den STEP436-Crash im Admin-Test-Guard beheben:

```text
Cannot access 'snapshot' before initialization
```

Der Fehler trat auf, sobald `/api/vip-sound/test` mit `forceAccess=true` den echten VIP-Sound-Pfad erreichte und der Guard-Snapshot geschrieben werden sollte.

## Betroffene Dateien
- `backend/modules/vip_sound_overlay.js`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Änderung
- Modulversion auf `1.8.20` erhöht.
- Feature auf `vip_admin_test_guard_snapshot_fix` geändert.
- Die fehlerhafte Selbstreferenz innerhalb der `snapshot`-Objekterstellung wurde entfernt.
- `forceAccessApplied` und `adminTestDailyUsageBypassed` werden weiterhin korrekt aus `extra` übernommen.
- `stats.lastRealFlowGuard` kann jetzt geschrieben werden.

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
- `version: 1.8.20`
- `feature: vip_admin_test_guard_snapshot_fix`
- Kein Fehler `Cannot access 'snapshot' before initialization`.
- Admin-Test-Response enthält `forceAccess: true`.
- Wenn der simulierte User nicht VIP/Mod ist, enthält die Response `forceAccessApplied: true`.
- `busModeGuard` ist nicht `null`, sobald der echte Sound-Pfad erreicht wurde.
- `stats.realFlowChecks` steigt.
- `stats.lastRealFlowGuard` ist nicht `null`.
- `stats.lastRealFlowGuard.runtimeVipBusMode` zeigt `bus_enabled`.
- `stats.lastRealFlowGuard.effectiveVipFlow` bleibt `legacy_sound_system_api`.
- `stats.lastRealFlowGuard.productiveBusAllowed` bleibt `false`.
- `stats.lastRealFlowGuard.productiveEntryPointChanged` bleibt `false`.
- Bei `consumeDaily=false` bleibt `dailyUsageWritten: false`.

## Hinweis
Dieser Fix repariert nur den Diagnosepfad aus STEP436. Er ist kein produktiver Berechtigungswechsel und kein Schritt zum automatischen Bus-Betrieb.
