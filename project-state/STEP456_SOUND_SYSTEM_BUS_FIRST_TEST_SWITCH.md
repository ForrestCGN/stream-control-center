# STEP456_SOUND_SYSTEM_BUS_FIRST_TEST_SWITCH

## Ziel
Das Sound-System testweise auf Bus-First fuer Sound-/Overlay-Ereignisse umstellen, ohne den alten WebSocket-Weg zu entfernen.

## Umsetzung
- `backend/modules/sound_system.js` Runtime-Version auf `0.1.18` erhoeht.
- `soundBus.mode` Default auf `bus_first` gesetzt.
- `soundBus.legacyFallback` Default auf `true` gesetzt.
- Sound-State- und Item-Events werden zuerst ueber den Communication-Bus gesendet.
- Der alte `op: sound_system` WebSocket wird nur noch als Fallback verwendet, wenn der Bus keinen Client erreicht.
- `/api/sound/status`, Device-Ausgabe, Discord, TTS, Queue, Priority, Bundle und Lock-Logik bleiben unveraendert.

## Nicht geaendert
- Kein Entfernen alter Sound-APIs.
- Kein Entfernen vom Overlay-Polling.
- Kein Umbau von Queue/Priority/Lock/TTS/Discord.
- Kein Dashboard-Umbau.

## Minimaler Testablauf
```bat
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP456 Sound System Bus First Test Switch"
node --check backend\modules\sound_system.js
```

Danach Node neu starten und kurz pruefen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status"
$s | Select-Object enabled,busMode,legacyFallbackEnabled,communicationBusAvailable
$s.stats | Select-Object emitted,errors,lastAction,lastError
```

Erwartung: `busMode = bus_first`, `legacyFallbackEnabled = True`, `errors = 0`.
