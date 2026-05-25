# STEP443 – VIP Bus-First optionaler Admin-Test ohne Legacy-Fallback

## Status
Vorbereitet als vollständiger Datei-STEP.

## Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.26`
- `backend/modules/sound_system.js`: `0.1.19`
- Feature: `vip_bus_first_no_legacy_admin_test`

## Ausgangslage
STEP441 hat die Datei-Auflösung für direkte VIP-Dateien im Sound-System-Play-Test repariert. STEP442 hat die Statusausgabe bereinigt, sodass `lastSoundId` bei direkten Datei-Payloads z. B. `vip/adoredpenny.mp3` zeigt.

Für die nächste Teststufe soll der explizite Admin-Testpfad eindeutig als Bus-First-Test ohne Legacy-Fallback erkennbar sein. Dadurch kann getestet werden, ob der neue Pfad alleine funktioniert, ohne den normalen Twitch-Command oder den produktiven Default umzuschalten.

## Änderung
In `backend/modules/vip_sound_overlay.js` wurde der Admin-Test um optionale Flags erweitert:

- `noLegacyFallback`
- `noLegacy`
- `busFirstOnly`
- `requireBusFirst`
- `disableLegacyFallback`

Wenn `busFirstTest=true` und `noLegacyFallback=true` gesetzt sind, zeigt die Antwort und der Guard-Snapshot zusätzlich:

- `noLegacyFallback: true`
- `busFirstOnly: true`
- `legacyFallbackAllowed: false`
- `legacyFallbackUsed: false`

Zusätzlich enthält `soundBusCommand` im VIP-Test jetzt direkte Auswertungsfelder:

- `accepted`
- `playedOrQueued`
- `started`
- `queued`
- `queueTouched`
- `audioTouched`
- `normalizedSoundId`
- `normalizedFile`

## Nicht geändert
- Kein produktiver Bus-Default.
- Kein normaler Twitch-Command-Umbau.
- Kein DailyUsage-Schreiben im Admin-Test mit `consumeDaily=false`.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Änderung an Legacy `/api/sound/play`.
- Keine Änderung am Sound-System seit STEP442.

## Tests

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js
```

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

## Erwartung
- VIP-Modul zeigt `version: 1.8.26`.
- Sound-System bleibt `version: 0.1.19`.
- `accepted: True`.
- `busFirstTestApplied: True`.
- `noLegacyFallback: True`.
- `legacyFallbackAllowed: False`.
- `legacyFallbackUsed: False`.
- `soundBusCommand.ok: True`.
- `playTestFailed: 0`.
- `lastError` leer.
- `lastSoundId` zeigt die getestete direkte VIP-Datei.
