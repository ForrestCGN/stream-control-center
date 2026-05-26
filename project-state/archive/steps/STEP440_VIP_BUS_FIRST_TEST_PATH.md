# STEP440 – VIP Bus-First Testpfad vorbereiten

## Ziel

Der Admin-Test soll einen expliziten Bus-First-Testpfad ausführen können, ohne den normalen Chat-Command umzuschalten.

## Version

- `vip_sound_overlay.js`: `1.8.23`
- Feature: `vip_bus_first_test_path_preparation`

## Geändert

- `/api/vip-sound/test` akzeptiert für Admin-Diagnose zusätzlich `busFirstTest=true`.
- In Kombination mit `vipBusMode=bus_enabled`, `forceAccess=true`, `consumeDaily=false` und `useExistingSound=true` wird der Sound-System-Play-Test-Pfad genutzt.
- Der Legacy-Queue-Pfad wird für diesen expliziten Admin-Test übersprungen.
- Guard- und Statusdaten bleiben sichtbar.

## Nicht geändert

- Normaler Twitch-Command bleibt geschützt.
- Kein produktiver Standardwechsel auf Bus-First.
- Keine DB-Migration.
- Keine DailyUsage bei `consumeDaily=false`.
- Keine Dashboard-Änderung.

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/vip-sound/test" `
  -ContentType "application/json" `
  -Body '{"login":"forrestcgn","consumeDaily":false,"forceAccess":true,"useExistingSound":true,"vipBusMode":"bus_enabled","busFirstTest":true}' |
ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/status" | ConvertTo-Json -Depth 10
```

## Erwartung

- `version: 1.8.23`
- `feature: vip_bus_first_test_path_preparation`
- `busFirstTest: true`
- `busFirstTestApplied: true`
- `busFirstTestPath: sound_system_play_test`
- `legacyQueueSkippedForBusFirstTest: true`
- `vipBusMode: bus_enabled`
- `runtimeVipBusMode: bus_enabled`
- normaler produktiver VIP-Flow bleibt unverändert geschützt.
