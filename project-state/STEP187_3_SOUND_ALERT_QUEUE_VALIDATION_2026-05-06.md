# STEP187.3 - Sound / Alert Queue Validation

Stand: 2026-05-06

## Zweck

Dieser STEP dokumentiert den Live-/API-Test nach STEP187.1 und STEP187.2. Ziel war zu pruefen, ob das Sound-System nach den Overlay-Stop- und Queue-Gap-Fixes wieder sauber mit Alerts zusammenarbeitet.

## Ausgangslage

Vorherige Fixes:

- STEP187.1: Sound-System-Overlay stoppt laufendes Overlay-Audio/Video, wenn Backend `current = null` meldet.
- STEP187.2: Nach Stop eines Overlay-Sounds startet das naechste Queue-Item verzögert, damit OBS/Browser den alten Player wirklich beenden kann.

## Getestete Live-Routen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/stop" -Method POST | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/clear" -Method POST | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch/bits?user=ForrestCGN&amount=100&message=SoundSystemTest" | ConvertTo-Json -Depth 30
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 30
```

## Bestaetigte Ergebnisse

### Sound-System idle vor Alert-Test

- `current = null`
- `queuedCount = 0`
- `parallelCount = 0`
- `device.lastOk = true`
- `deviceFailed = 0`

### Device-Ausgabe bestaetigt

Der vorherige Airhorn-Test lief ueber das lokale Audio-Device:

- Datei: `D:\Streaming\stramAssets\htdocs\assets\sounds\airhorn.mp3`
- Device: `Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)`
- Helper: `AudioDeviceHelper 0.4.2`
- Mode: `wasapi`
- `deviceStarted = 1`
- `deviceFailed = 0`

### Alert-Test bestaetigt

Test-Route:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch/bits?user=ForrestCGN&amount=100&message=SoundSystemTest" | ConvertTo-Json -Depth 30
```

Ergebnis:

- Alert wurde angenommen.
- `matchedRule = 27`
- Regel: `100- 249 Bits Normal`
- Sound-Datei: `/assets/sounds/alerts/1777654020330_100-249.mp3`
- Sound-System Request:
  - `file = alerts/1777654020330_100-249.mp3`
  - `category = alert`
  - `outputTarget = device`
  - `priority = 100`
  - `requestedBy = ForrestCGN`
- Sound-System Ergebnis:
  - `ok = true`
  - `started = true`
  - `queued = false`

Nach Abschluss:

- `current = null`
- `queue = []`
- `device.lastOk = true`
- `deviceStarted = 2`
- `deviceFailed = 0`
- Letztes Device-Playback:
  - Datei: `D:\Streaming\stramAssets\htdocs\assets\sounds\alerts\1777654020330_100-249.mp3`
  - Volume: `85`
  - Dauer: `5592 ms`
  - Mode: `wasapi`

## Fachlich bestaetigter Stand

- Videos bleiben immer Overlay.
- Audio-Dateien folgen dem konfigurierten `outputTarget`.
- Alert-Sounds koennen sauber ueber `device` laufen.
- Stop eines Overlay-Videos blockiert oder ueberlagert den naechsten Queue-Sound nicht mehr.
- Queue und Current-State sind nach Abschluss sauber leer.

## Bewusst offen

- `generated_beep + outputTarget=device` funktioniert noch nicht, weil `generated/beep.wav` keine echte Datei ist.
- Das ist aktuell kein Blocker und wird spaeter fuer Dashboard-Testton/Config-Test neu bewertet.
- `client.lastEvent` bleibt teilweise auf `audio_started`; funktional aktuell nicht kritisch, spaeter fuer Status-Anzeige verbesserbar.

## Betroffene Dateien durch vorherige Fixes

- `backend/modules/sound_system.js`
- `htdocs/overlays/sound_system_overlay.html`

Dieser STEP selbst ist eine Doku-/Validierungsergaenzung.
