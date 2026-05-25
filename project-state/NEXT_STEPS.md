# NEXT_STEPS

## Direkt nach STEP442

1. Syntax prüfen:

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js
```

2. STEP442-Test ausführen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/sound-command/reset" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/reset" | ConvertTo-Json -Depth 10
$r = Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/vip-sound/test" `
  -ContentType "application/json" `
  -Body '{"login":"forrestcgn","consumeDaily":false,"forceAccess":true,"useExistingSound":true,"vipBusMode":"bus_enabled","busFirstTest":true}'

$r.soundBusCommand | Select-Object ok,error,busFirstTest,playTestOnly,testOnly
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/status"
$s.stats | Select-Object playTestOk,playTestFailed,lastAction,lastError,lastSoundId
```

3. Erwartung:

- `ok: True`
- `error` leer
- `playTestFailed: 0`
- `lastError` leer
- `lastSoundId: vip/adoredpenny.mp3` oder getestete Datei

## Danach möglich

STEP443 – Entscheidung vorbereiten, ob und wie ein expliziter Bus-First-Testmodus ins Dashboard kommt. Noch keine produktive Chat-Command-Umschaltung.
