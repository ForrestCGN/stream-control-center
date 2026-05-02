# Sound-System STEP – 2026-05-02

## Status

Dieser Stand beschreibt den aktuell funktionierenden Sound-System-Zwischenstand auf Branch `dev`.

Aktueller funktionierender Commit:

```txt
8de7a2f Fix sound client routes after timeout patch
```

Relevante vorherige Commits:

```txt
9caaf78 Fix dynamic helper timeout for long sounds
2bc8433 Use real sound duration and prepare parallel policy
7df137c Connect sound core to audio device helper
```

## Wichtige Dateien

```txt
backend/modules/sound_system.js
config/sound_system.json
tools/audio-device-helper/AudioDeviceHelper.csproj
tools/audio-device-helper/Program.cs
tools/audio-device-helper/build-helper.ps1
```

Live-Pfade auf dem Stream-System:

```txt
D:\Streaming\stramAssets\backend\modules\sound_system.js
D:\Streaming\stramAssets\config\sound_system.json
D:\Streaming\stramAssets\tools\audio-device-helper\dist\AudioDeviceHelper.exe
D:\Streaming\stramAssets\htdocs\assets\sounds\
```

## Getestete Funktionen

### 1. Echte Sounddauer per ffprobe

Dateien werden über `helper_media.getAudioInfo()` geprüft. Die Sounddauer wird aus `ffprobe` übernommen.

Bestätigter Test mit:

```txt
D:\Streaming\stramAssets\htdocs\assets\sounds\opa01.mp3
```

Erwartetes Ergebnis im API-Response:

```json
"durationOk": true,
"durationSource": "ffprobe"
```

### 2. AudioDeviceHelper-Ausgabe

Der Sound-Core kann Sounds über `AudioDeviceHelper.exe` auf ein ausgewähltes Windows-Audiogerät ausgeben.

Bestätigtes Gerät:

```txt
Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)
{0.0.0.00000000}.{d2b8e581-1cae-48b9-9b2a-deb3d488b356}
```

Bestätigtes Ergebnis:

```json
"lastOk": true,
"deviceName": "Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)",
"mode": "wasapi"
```

### 3. Dynamischer Helper-Timeout

Der Helper-Timeout wird nicht mehr blind aus der Config übernommen. Lange Sounds werden nicht mehr nach 8 oder 30 Sekunden beendet.

Logik:

```txt
effectiveTimeoutMs = max(configTimeoutMs, soundDurationMs + outroMs + 10000)
```

Bestätigter Test mit:

```txt
D:\Streaming\stramAssets\htdocs\assets\sounds\crew\Araglor Immer Dabei.mp3
```

Dauer:

```txt
180000 ms
```

Erwarteter Runtime-Timeout:

```txt
ca. 190350 ms
```

Bestätigter API-Wert:

```json
"timeoutMs": 190350
```

### 4. Queue-Verhalten

Während ein langer Sound läuft, wird ein normaler zweiter Sound korrekt in die Queue gelegt.

Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&volume=100"
```

Erwartung:

```json
"started": false,
"queued": true,
"queuePosition": 1
```

### 5. Parallel-Sounds

Sounds mit:

```txt
parallelAllowed=true
category=system
```

werden parallel zum laufenden Hauptsound abgespielt, sofern die Kategorie in `queue.parallelCategories` erlaubt ist.

Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&volume=100&parallelAllowed=true&category=system"
```

Bestätigt:

```txt
Parallel-Sound wurde abgespielt.
Parallel-Sound blieb nicht zusätzlich in der Queue hängen.
Hauptsound lief weiter.
```

### 6. Queue läuft nach Hauptsound weiter

Nach Ende des langen Sounds wurde der normal gequeuete `opa01.mp3` automatisch abgespielt.

Bestätigt:

```txt
Araglor lief durch.
Opa lief danach automatisch.
```

## Aktuelle bekannte offene Punkte

### 1. Version-Anzeige

`/api/sound/status` zeigt aktuell weiterhin:

```json
"version": "0.1.4"
```

Grund: `state.version` kommt aktuell noch aus `config.version` in `sound_system.json`.

Nicht kritisch für Funktion, aber verwirrend.

Geplanter Fix später, klein und kontrolliert:

```json
"version": "0.1.x",
"moduleVersion": "0.1.x",
"configVersion": "0.1.4"
```

Wichtig: Dieser Fix wurde einmal fehlerhaft per kompletter Datei-Ersetzung versucht und wieder verworfen. Künftig nur als kleiner Patch durchführen.

### 2. Dashboard-Geräteauswahl

Die Backend-API kann das Gerät speichern. Dashboard-Seite muss später sauber anzeigen, auswählen und persistieren:

```txt
/api/sound/devices
/api/sound/devices/select
/api/sound/reload
```

### 3. Build-Ausgaben nicht committen

Diese Ordner sind lokale Build-Ausgaben und gehören nicht ins Git-Repo:

```txt
tools/audio-device-helper/bin/
tools/audio-device-helper/obj/
tools/audio-device-helper/dist/
```

## Wichtige Testbefehle

Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 20
```

AUX setzen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/devices/select" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"deviceId":"{0.0.0.00000000}.{d2b8e581-1cae-48b9-9b2a-deb3d488b356}","deviceName":"Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)","enabled":true}'
```

Config reload:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/reload" -Method POST
```

Kurzer Device-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&volume=100" | ConvertTo-Json -Depth 20
```

Langer Device-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=crew%2FAraglor%20Immer%20Dabei.mp3&outputTarget=device&override=true&volume=100" | ConvertTo-Json -Depth 20
```

Parallel-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&volume=100&parallelAllowed=true&category=system" | ConvertTo-Json -Depth 20
```

Reset:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/reset" -Method POST
```

## Aktueller empfohlener nächster Schritt

1. Alten Backup-Branch löschen:

```powershell
git push origin --delete backup/dev-before-sound-core-device-output
```

2. Den neueren Backup-Branch noch behalten, bis dieser STEP vollständig abgeschlossen ist:

```txt
backup/dev-before-sound-duration-parallel-policy
```

3. Danach Dashboard-Geräteauswahl prüfen/verbessern.
