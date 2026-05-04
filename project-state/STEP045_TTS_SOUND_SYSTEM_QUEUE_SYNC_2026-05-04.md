# STEP045 - TTS Sound-System Queue Sync

Stand: 2026-05-04

## Zweck

Dieser STEP koppelt die interne Chat-TTS-Queue sauberer an das Sound-System.

Bisheriger Stand nach STEP044:

- Chat-TTS erzeugt Audio.
- Audio wird ueber `/api/sound/play` an das Sound-System gegeben.
- Das TTS-Overlay zeigt den aktuell laufenden Sound-System-Status an.
- Die interne TTS-Queue wurde noch per Dauer-Timer freigegeben.

Das funktionierte, war aber noch nicht perfekt, wenn das Sound-System ein TTS-Item wegen anderer Sounds zunaechst einreiht.

## Neuer Ablauf

Bei `chatTts.playbackMode = sound_system` und `chatTts.doneMode = sound_system_status` gilt:

1. TTS erzeugt die Audio-Datei.
2. TTS sendet die Datei an `/api/sound/play`.
3. TTS pollt `/api/sound/status`.
4. TTS wartet, bis das eigene Sound-System-Item als `current`, `parallel` oder `queue` erkannt wird.
5. Sobald das Item einmal als laufend/gefunden erkannt wurde und danach nicht mehr im Sound-System-Status auftaucht, wird das TTS-Item intern als fertig markiert.
6. Erst danach wird das naechste TTS-Queue-Item gestartet.

Damit ist das Sound-System die Audio-Wahrheit.

## Neue/erweiterte Chat-TTS-Settings

Diese Werte liegen in `tts_settings` unter Key `chatTts`:

```json
{
  "playbackMode": "sound_system",
  "overlayVisualEnabled": true,
  "soundSystemEnabled": true,
  "soundSystemPlayUrl": "http://127.0.0.1:8080/api/sound/play",
  "soundSystemStatusUrl": "http://127.0.0.1:8080/api/sound/status",
  "soundSystemCategory": "tts",
  "soundSystemSource": "tts_system",
  "soundSystemOutputTarget": "device",
  "soundSystemVolume": 100,
  "soundSystemPriority": 50,
  "doneMode": "sound_system_status",
  "doneExtraBufferMs": 500,
  "statusPollMs": 350,
  "statusMaxWaitMs": 120000,
  "fallbackToOverlay": true
}
```

## Fallback

`doneMode = duration_timer` bleibt weiterhin moeglich.

Das ist als Notfall-/Kompatibilitaetsmodus gedacht, falls das Sound-System-Status-Polling nicht genutzt werden soll.

## Wichtige Hinweise

- Keine Aenderung am TTS-Overlay in diesem STEP.
- Keine Aenderung am Sound-System-Modul in diesem STEP.
- Keine Funktionalitaet entfernt.
- Chat-TTS bleibt ueber Sound-System aktiv.
- TTS-Overlay bleibt ueber Sound-System-Visual-State sichtbar.
- Die neue Logik benoetigt, dass Sound-System-Items ihre `visual.requestId`/`meta.ttsId` behalten. Das ist seit STEP044.4 so vorbereitet.

## Nach dem Deploy noetiger DB-Upsert

Wenn die bestehende DB noch `doneMode = duration_timer` enthaelt, muss der `chatTts`-Setting-Block einmal aktualisiert werden.

PowerShell:

```powershell
$body = @{
  key = "chatTts"
  valueType = "json"
  description = "Chat-TTS Ausgabe ueber Sound-System oder Overlay"
  value = @{
    playbackMode = "sound_system"
    overlayVisualEnabled = $true
    soundSystemEnabled = $true
    soundSystemPlayUrl = "http://127.0.0.1:8080/api/sound/play"
    soundSystemStatusUrl = "http://127.0.0.1:8080/api/sound/status"
    soundSystemCategory = "tts"
    soundSystemSource = "tts_system"
    soundSystemOutputTarget = "device"
    soundSystemVolume = 100
    soundSystemPriority = 50
    doneMode = "sound_system_status"
    doneExtraBufferMs = 500
    statusPollMs = 350
    statusMaxWaitMs = 120000
    fallbackToOverlay = $true
  }
} | ConvertTo-Json -Depth 20

Invoke-RestMethod "http://127.0.0.1:8080/api/tts/settings/upsert" -Method POST -ContentType "application/json" -Body $body | ConvertTo-Json -Depth 10
```

## Testplan

1. Sound-System beschaeftigen, z. B. langen Alert/Sound starten.
2. Waehrenddessen `!tts langer Testtext` senden.
3. Erwartung:
   - TTS wird vom Sound-System eingereiht.
   - Overlay zeigt TTS erst, wenn das Sound-System das TTS-Item abspielt.
   - Die interne TTS-Queue startet das naechste TTS-Item erst nach Sound-System-Ende des aktuellen TTS.
   - `/api/tts/status` bleibt waehrend Warte-/Abspielphase bei `playing=true` fuer das aktuelle Item und geht danach auf `playing=false` bzw. naechstes Item.

## Dateien

- `backend/modules/tts_system.js`
- `project-state/STEP045_TTS_SOUND_SYSTEM_QUEUE_SYNC_2026-05-04.md`
