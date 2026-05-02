# Sound-System STEP – 2026-05-02

## Status

Dieser Stand beschreibt den aktuellen Sound-System-Zwischenstand auf Branch `dev`.

Neue Commits dieses Steps:

```txt
73ccf85 Align sound output helper defaults
93cfa32 Show sound queue policy and alert sync state in dashboard
8639360 Prepare sound priority and alert sync policy config
```

Wichtige vorherige Commits:

```txt
70f00e2 Hide redundant sound output target pills
18682bb Simplify sound output mode UI
61af8e6 Bind sound dashboard actions reliably
a9ab6cd Fix sound dashboard output state display and save feedback
5a1cbfc Persist full sound output settings from dashboard
ac9ac62 Wire sound dashboard device controls to working endpoints
7726f8f Add Sound-System STEP documentation
8de7a2f Fix sound client routes after timeout patch
9caaf78 Fix dynamic helper timeout for long sounds
2bc8433 Use real sound duration and prepare parallel policy
7df137c Connect sound core to audio device helper
```

## Wichtige Dateien

```txt
backend/modules/sound_system.js
backend/modules/sound_output_config.js
backend/modules/helpers/helper_media.js
config/sound_system.json
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
htdocs/overlays/sound_system_overlay.html
tools/audio-device-helper/Program.cs
tools/audio-device-helper/AudioDeviceHelper.csproj
tools/audio-device-helper/build-helper.ps1
docs/sound_system/STEP_sound_system_2026-05-02.md
```

## Weiterhin gültiger Funktionsstand

- AudioDeviceHelper funktioniert.
- Direkte Ausgabe auf Windows-Audiogeräte funktioniert.
- Getestetes Gerät: `Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)` / `{0.0.0.00000000}.{d2b8e581-1cae-48b9-9b2a-deb3d488b356}`.
- WASAPI funktioniert für Voicemeeter AUX.
- Echte Sounddauer wird per `ffprobe` über `helper_media.getAudioInfo()` ermittelt.
- Lange Sounds brechen nicht mehr wegen Helper-Timeout ab.
- Dynamischer Helper-Timeout funktioniert.
- Queue funktioniert.
- Parallel-Sounds sind vorbereitet und grundsätzlich getestet.
- Sound-Dashboard ist vorhanden und wurde vereinfacht.

## Neuer Stand dieses Steps

### 1. Alert-Sync-Policy in Config vorbereitet

`config/sound_system.json` wurde auf Version `0.1.8` angehoben.

Neu bzw. erweitert:

```txt
queue.sortByPriority
queue.allowParallel
queue.maxParallel
queue.parallelCategories
queue.parallelSoundIds
queue.alertSync
queue.interruptRules
queue.dropRules
queue.cooldowns
queue.dedupe
priorities
categoryDefaults
```

Wichtige Policy:

```txt
Normale Alerts unterbrechen keine laufenden Sounds/Lieder.
Alerts werden nach Priorität in die Sound-Queue einsortiert.
Wenn ein Alert-Sound-Item später dran ist, soll das Alert-System den visuellen Alert synchron dazu anzeigen.
```

Prioritätsidee in der Config:

```txt
100 = admin/system
90  = alert_critical
80  = alert
70  = channel_reward
60  = vip/crew/special
50  = fun/tts
20  = background/decor
```

Alert-Defaults:

```txt
priority=80
canInterrupt=false
canBeInterrupted=false
queueIfBusy=true
dropIfBusy=false
parallelAllowed=false
```

### 2. Dashboard erweitert

`htdocs/dashboard/modules/sound.js` zeigt nun zusätzlich:

```txt
- Parallel-Anzahl im Status
- Policy-Karte mit Prioritäts-Queue, Max Queue, Max Parallel, Alert-Priorität, Alert-Sync und Interrupt-Schwelle
- Aktueller Sound mit Kategorie, Quelle, OutputTarget, Priorität und Unterbrechbar-Status
- Queue mit Kategorie, Quelle, Priorität, OutputTarget und Lautstärke
```

### 3. Output-Helper-Defaults angeglichen

`backend/modules/sound_output_config.js` nutzt jetzt denselben Helper-Pfad wie die echte Config:

```txt
tools/audio-device-helper/dist/AudioDeviceHelper.exe
```

Außerdem sind die Defaults angeglichen:

```txt
helper.enabled=true
timeoutMs=30000
playbackMode=auto
```

## Wichtige offene Punkte

### 1. Sound-Core-Policy-Patch fehlt noch

Die Config und das Dashboard sind vorbereitet. Der nächste technische Step ist der kontrollierte Patch in:

```txt
backend/modules/sound_system.js
```

Geplant:

```txt
- categoryDefaults beim normalizePlayRequest berücksichtigen
- priorities aus config.priorities als Fallback nutzen
- queue.sortByPriority beachten
- queue.interruptRules statt hartem override/canInterrupt-Ausdruck nutzen
- meta und visual an Sound-Items erlauben
- publicItem() gibt meta/visual aus
- startItem() sendet eindeutige Start-Events für spätere Alert-Sync-Anbindung
```

Dieser Core-Patch wurde in diesem Step bewusst noch nicht als riskanter Komplett-Rewrite gemacht, damit keine bestehende Funktionalität beschädigt wird.

### 2. Alert-System ist noch nicht angebunden

Noch nicht geändert:

```txt
backend/modules/alerts*
config/alerts*
htdocs/dashboard/modules/alerts*
```

Ziel später:

```txt
Alert-System entscheidet, welcher Alert mit welchem Sound kommt.
Sound-System entscheidet, wann/wie/wo der Sound läuft.
Alert-System zeigt den visuellen Alert erst, wenn das Sound-System das Alert-Sound-Item startet.
```

## Testbefehle

Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 20
```

Output anzeigen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/output" | ConvertTo-Json -Depth 20
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

Vorbereiteter Alert-Queue-Test ohne echte Alert-Anbindung:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&volume=100&category=alert&priority=80&source=alert_system&canInterrupt=false&canBeInterrupted=false&queueIfBusy=true" | ConvertTo-Json -Depth 20
```

Reset:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/reset" -Method POST
```

## Nächster empfohlener Step

1. Lokal `git pull` auf Branch `dev`.
2. Backend neu starten.
3. `/api/sound/status` und Dashboard prüfen.
4. Danach Core-Policy-Patch in `backend/modules/sound_system.js`.

Backup-Branch aktuell weiter behalten:

```txt
origin/backup/dev-before-sound-duration-parallel-policy
```
