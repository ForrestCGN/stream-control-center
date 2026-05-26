# STEP442 – VIP Bus-First Testauswertung / Status Cleanup

## Status
Vorbereitet als vollständiger Datei-STEP.

## Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.25`
- `backend/modules/sound_system.js`: `0.1.19`
- Feature: `vip_bus_first_status_cleanup`

## Ausgangslage
STEP441 hat den eigentlichen Resolve-Fehler behoben: Der Sound-System-Play-Test akzeptiert direkte VIP-Dateien wie `vip/adoredpenny.mp3`.

In der gekürzten Statusausgabe blieb aber `stats.lastSoundId` im Sound-System-Command-Status leer, weil direkte Datei-Payloads keinen Preset-`soundId` mehr verwenden. Funktional war der Test erfolgreich, diagnostisch war die Anzeige unvollständig.

## Änderung
In `backend/modules/sound_system.js` wurde die Status-/RecentCommand-Ausgabe für direkte Datei-Payloads ergänzt:

- `state.soundBusCommand.lastSoundId` wird jetzt auch im Sound-System gepflegt.
- Bei direkter Datei wird als sichtbarer Sound-Key die Datei verwendet, z. B. `vip/adoredpenny.mp3`.
- Dry-Run und Play-Test setzen `lastSoundId` bei Erfolg und Fehler.
- `recentCommands` enthält zusätzlich `file` bei direkten Datei-Payloads.
- Reset leert `lastSoundId` sauber.

In `backend/modules/vip_sound_overlay.js` wurde nur Versions-/Feature-/STEP-Diagnose auf STEP442 aktualisiert.

## Nicht geändert
- Kein produktiver Bus-Default.
- Kein normaler Twitch-Command-Umbau.
- Kein DailyUsage-Schreiben im Admin-Test mit `consumeDaily=false`.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Änderung an der bestehenden Legacy `/api/sound/play`-Produktivroute.
- Keine Änderung an der STEP441-Dateiauflösung selbst.

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
  -Body '{"login":"forrestcgn","consumeDaily":false,"forceAccess":true,"useExistingSound":true,"vipBusMode":"bus_enabled","busFirstTest":true}'

$r.soundBusCommand | Select-Object ok,error,busFirstTest,playTestOnly,testOnly
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/command/status"
$s.stats | Select-Object playTestOk,playTestFailed,lastAction,lastError,lastSoundId
```

## Erwartung
- VIP-Modul zeigt `version: 1.8.25`.
- Sound-System zeigt `version: 0.1.19`.
- `soundBusCommand.ok: True`.
- `soundBusCommand.error` ist leer.
- `playTestOk` steigt.
- `playTestFailed` bleibt `0`.
- `lastError` ist leer.
- `lastSoundId` zeigt `vip/adoredpenny.mp3` oder die getestete direkte VIP-Datei.
