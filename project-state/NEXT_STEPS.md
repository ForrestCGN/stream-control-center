# NEXT_STEPS

## Direkt nach STEP443

1. Syntax prüfen:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js
```

2. STEP443-Kurztest ausführen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/reset" | ConvertTo-Json -Depth 10

$r = Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/vip-sound/test" `
  -ContentType "application/json" `
  -Body '{"login":"forrestcgn","consumeDaily":false,"forceAccess":true,"useExistingSound":true,"vipBusMode":"bus_enabled","busFirstTest":true,"noLegacyFallback":true}'

$r | Select-Object accepted,reason,busFirstTest,busFirstTestApplied,noLegacyFallback,busFirstOnly,legacyFallbackAllowed,legacyFallbackUsed,legacyQueueSkippedForBusFirstTest,soundSystemQueued,soundSystemStarted,vipBusMode,runtimeVipBusMode,effectiveSoundEntryPoint,dailyUsageWritten

$r.soundBusCommand | Select-Object ok,error,busFirstTest,playTestOnly,testOnly,accepted,playedOrQueued,started,queued,queueTouched,audioTouched,normalizedSoundId,normalizedFile,noLegacyFallback,legacyFallbackAllowed,legacyFallbackUsed

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/status"
$s.stats | Select-Object playTestOk,playTestFailed,lastAction,lastError,lastSoundId
```

3. Erwartung:

- `accepted: True`
- `busFirstTestApplied: True`
- `noLegacyFallback: True`
- `legacyFallbackAllowed: False`
- `legacyFallbackUsed: False`
- `legacyQueueSkippedForBusFirstTest: True`
- `soundBusCommand.ok: True`
- `playTestFailed: 0`
- `lastError` leer
- `lastSoundId: vip/adoredpenny.mp3` oder getestete Datei

## Danach möglich

STEP444 – Dashboard-/Admin-Test-Schalter vorbereiten, aber weiterhin keine produktive Chat-Command-Umschaltung.
