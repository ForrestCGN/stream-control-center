# STEP044 - Chat-TTS Sound-System Playback

Stand: 2026-05-04

## Zweck

Normales Chat-TTS wird an die neue Audio-Architektur angepasst.

Bisher spielte Chat-TTS die Audiodatei im TTS-Overlay ab und wartete darauf, dass das Overlay `/api/tts/done` meldet. Wenn das Overlay Audio nicht startet oder nicht meldet, bleibt die TTS-Queue auf `playing=true` hängen.

Neu ist Chat-TTS konfigurierbar:

- `sound_system`: Audio läuft über das Sound-System, Overlay zeigt nur visuell an.
- `overlay`: altes Verhalten, Overlay spielt Audio und meldet done.
- `off`: kein Audio, optional nur visuelle Anzeige.

Default für ForrestCGN ist `sound_system`.

## Geänderte Dateien

- `backend/modules/tts_system.js`
- `htdocs/overlays/_overlay-tts.html`
- `project-state/STEP044_CHAT_TTS_SOUND_SYSTEM_PLAYBACK_2026-05-04.md`

## Neue DB-Settings

In `tts_settings` wird ein neuer JSON-Block angelegt, wenn er noch fehlt:

```json
{
  "chatTts": {
    "playbackMode": "sound_system",
    "overlayVisualEnabled": true,
    "soundSystemEnabled": true,
    "soundSystemPlayUrl": "http://127.0.0.1:8080/api/sound/play",
    "soundSystemCategory": "tts",
    "soundSystemSource": "tts_system",
    "soundSystemOutputTarget": "device",
    "soundSystemVolume": 100,
    "soundSystemPriority": 50,
    "doneMode": "duration_timer",
    "doneExtraBufferMs": 500,
    "fallbackToOverlay": true
  }
}
```

## Backend-Verhalten

Bei `playbackMode = sound_system`:

1. TTS erzeugt wie bisher die Audiodatei.
2. TTS misst die Dauer per ffprobe.
3. TTS ruft `/api/sound/play` mit `soundSystemFile` auf.
4. TTS sendet weiterhin `tts_play` an das Overlay, aber mit `visualOnly=true` und ohne Audio-URL.
5. TTS setzt `done` intern nach `durationMs + doneExtraBufferMs`.
6. Die Queue bleibt dadurch nicht mehr vom Browser-Audio abhängig.

Bei `playbackMode = overlay` bleibt das alte Verhalten erhalten.

## Overlay-Verhalten

Das Overlay kann jetzt zwei Modi:

- Audio-Modus: spielt `audioUrl` selbst ab und ruft danach `/api/tts/done`.
- Visual-only-Modus: zeigt User/Text nur visuell an und ruft nach Ablauf ebenfalls `/api/tts/done` als Safety-Net.

## Testplan

Nach Einspielen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tts/settings" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 10
```

Dann normales `!tts Test` im Chat.

Erwartung:

- Chat meldet wie bisher "Durchsage aufgenommen".
- Sound-System spielt die TTS-Datei.
- TTS-Overlay zeigt Text/Name visuell.
- TTS kommt nicht aus dem Overlay-Audio.
- `/api/tts/status` geht nach Ende automatisch zurück auf `playing=false`.

## Wichtig

- Keine bestehende Chat-TTS-Funktionalität entfernt.
- Overlay-Modus bleibt als Fallback erhalten.
- Alert-TTS bleibt unverändert über das Sound-System.
- Dashboardfähigkeit ist über DB-Settings vorbereitet.
