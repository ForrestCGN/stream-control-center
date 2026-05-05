# STEP188 - Sound-System Video Queue

Stand: 2026-05-05

## Zweck

Dieser STEP erweitert das bestehende Sound-System so, dass neben Audio-Dateien auch Video-Dateien ueber das vorhandene Sound-System-Overlay abgespielt werden koennen.

Wichtig: Es wurde kein neues Media-Overlay eingefuehrt. Das vorhandene `sound_system_overlay.html` bleibt die zentrale OBS-Browserquelle.

## Sicherheitsbackup

Vor diesem STEP wurde ein komplettes Backup von `D:\Streaming\stramAssets` erstellt:

- Backup-Name: `26-05-05 - 2`

## Betroffene Dateien

- `backend/modules/sound_system.js`
- `backend/modules/helpers/helper_media.js`
- `htdocs/overlays/sound_system_overlay.html`
- `config/sound_system.json`
- `htdocs/assets/sounds/soundalerts/audio/`
- `htdocs/assets/sounds/soundalerts/video/`

## Aenderungen

### helper_media.js

- `DEFAULT_ALLOWED_EXTENSIONS` erweitert um `.mp4`.
- Neue Media-Info-Funktionen:
  - `readMediaInfo(filePath, options)`
  - `readVideoInfo(filePath, options)`
  - `getMediaInfo(fileName, options)`
- ffprobe liest jetzt fuer Medien:
  - `durationMs`
  - `hasVideo`
  - `hasAudio`
  - `width`
  - `height`
  - `formatName`
  - `videoCodec`
  - `audioCodec`
- Bestehende Audio-Funktionen bleiben erhalten:
  - `readAudioDurationMs`
  - `getAudioInfo`

### sound_system.js

- Sound-Items koennen jetzt `mediaType`, `mediaUrl`, `videoUrl`, `videoWidth`, `videoHeight`, `hasVideo`, `hasAudio` ausgeben.
- Dateien werden ueber `media.getMediaInfo(...)` statt nur `getAudioInfo(...)` ausgewertet.
- Wenn ffprobe einen Videostream erkennt oder `mediaType/type = video` gesetzt ist, wird das Item als Video behandelt.
- Video-Items werden auf `outputTarget = overlay` gezwungen, weil Video ueber das OBS-Browseroverlay laufen muss.
- Device-Ausgabe wird fuer Video-Items bewusst nicht gestartet, um doppelte/fehlerhafte Ausgabe zu vermeiden.
- Bei Video-Overlay-Items wartet das Sound-System auf das Overlay-Ende.
- Auto-Finish bleibt als Sicherheitsfallback erhalten:
  - Bei bekannter Videodauer: `durationMs + outroMs + videoFallbackBufferMs`
  - Bei unbekannter Videodauer: `videoFallbackFinishMs`
- Client-Endmeldungen werden nur noch dann auf das aktuelle Item angewendet, wenn `requestId` fehlt oder zur aktuellen Queue passt.

### sound_system_overlay.html

- Neues `<video id="videoPlayer">` im bestehenden Overlay.
- Video wird zentriert dargestellt.
- Video bleibt in Originalgroesse, maximal 1920x1080.
- Kleinere Videos werden nicht hochskaliert.
- `object-fit: contain`, kein Abschneiden.
- Overlay meldet weiterhin kompatibel ueber:
  - `/api/sound/client/audio-started`
  - `/api/sound/client/audio-ended`
  - `/api/sound/client/error`
- Endpunktnamen bleiben bewusst unveraendert, damit bestehende Backend-Kompatibilitaet erhalten bleibt.

### config/sound_system.json

- Version auf `0.1.11` gesetzt.
- `.mp4` in `allowedExtensions` aufgenommen.
- Neue Overlay-Fallbackwerte:
  - `videoFallbackBufferMs = 5000`
  - `videoFallbackFinishMs = 300000`

### Asset-Verzeichnisse

Neu vorbereitet:

- `htdocs/assets/sounds/soundalerts/audio/`
- `htdocs/assets/sounds/soundalerts/video/`

Diese Ordner sind fuer die spaetere SoundAlerts-Chat-Bridge vorgesehen.

## Beispiel: Video ueber API testen

Nach Deploy und Backend-Neustart eine Testdatei ablegen, z. B.:

```text
D:\Streaming\stramAssets\htdocs\assets\sounds\soundalerts\video\test.mp4
```

Dann testen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play" -Method Post -ContentType "application/json" -Body '{"file":"soundalerts/video/test.mp4","label":"Video Test","mediaType":"video","category":"test","priority":60,"outputTarget":"overlay","volume":100}' | ConvertTo-Json -Depth 20
```

Status pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 20
```

## Bewusst offen

- SoundAlerts-Chat-Bridge ist noch nicht enthalten.
- Dashboard-Mapping SoundAlerts-Name -> lokale Audio-/Video-Datei ist noch nicht enthalten.
- Upload-Verwaltung fuer SoundAlerts-Dateien ist noch nicht enthalten.
- Zentrale Status-Dokus (`docs/current/CURRENT_SYSTEM_STATUS.md`, `project-state/CURRENT_STATUS.md`, `CHANGELOG.md`, `FILES.md`, `NEXT_STEPS.md`) muessen nach erfolgreichem Live-Test final synchronisiert werden, damit kein historischer Stand blind ueberschrieben wird.

## Teststatus in dieser Arbeitsumgebung

Ausgefuehrt:

- `node -c backend/modules/sound_system.js`
- `node -c backend/modules/helpers/helper_media.js`
- Overlay-Script syntaktisch extrahiert und mit `node -c` geprueft.
- `config/sound_system.json` mit `python -m json.tool` validiert.

Nicht ausgefuehrt:

- Live-Backend-Test, weil Live-System nur lokal bei Forrest verfuegbar ist.
- Echter OBS-Overlay-Test.
- Echter Video-Abspieltest mit lokaler Datei.
