# Sound-System STEP – 2026-05-02

## Status

Dieser Stand beschreibt den aktuellen Sound-System-Zwischenstand auf Branch `dev` nach getestetem Core-Policy-Patch.

Neue Commits dieses Steps:

```txt
d625421 Apply sound core priority policy
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

## Aktueller getesteter Funktionsstand

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
- Core-Policy für `categoryDefaults`, `priorities`, `meta`, `visual` und `interruptRules` ist aktiv.

## Neuer Stand dieses Steps

### 1. Alert-Sync-Policy in Config vorbereitet

`config/sound_system.json` steht auf Version `0.1.8`.

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

`htdocs/dashboard/modules/sound.js` zeigt zusätzlich:

```txt
- Parallel-Anzahl im Status
- Policy-Karte mit Prioritäts-Queue, Max Queue, Max Parallel, Alert-Priorität, Alert-Sync und Interrupt-Schwelle
- Aktueller Sound mit Kategorie, Quelle, OutputTarget, Priorität und Unterbrechbar-Status
- Queue mit Kategorie, Quelle, Priorität, OutputTarget und Lautstärke
```

### 3. Output-Helper-Defaults angeglichen

`backend/modules/sound_output_config.js` nutzt denselben Helper-Pfad wie die echte Config:

```txt
tools/audio-device-helper/dist/AudioDeviceHelper.exe
```

Außerdem sind die Defaults angeglichen:

```txt
helper.enabled=true
timeoutMs=30000
playbackMode=auto
```

### 4. Core-Policy-Patch aktiv

`backend/modules/sound_system.js` wurde mit Commit `d625421` erweitert.

Aktiv:

```txt
- categoryDefaults werden beim normalizePlayRequest berücksichtigt
- priorities aus config.priorities werden als Fallback genutzt
- queue.sortByPriority wird beachtet
- queue.interruptRules ersetzt die harte alte Interrupt-Logik
- meta und visual werden an Sound-Items erlaubt
- publicItem() gibt meta/visual/lifecycle aus
- startItem() sendet item_started WebSocket-Event für spätere Alert-Sync-Anbindung
- Drop-Regeln bei Busy / voller Queue sind vorbereitet
- Cooldown/Dedupe Runtime-State ist vorbereitet
```

Getesteter Alert-Simulations-Request:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&volume=100&category=alert&source=alert_system&meta={%22alertId%22:%22test-alert-1%22,%22provider%22:%22test%22}&visual={%22module%22:%22alert_system%22,%22eventId%22:%22test-alert-1%22}" | ConvertTo-Json -Depth 20
```

Bestätigtes Ergebnis:

```txt
category=alert
priority=80
canInterrupt=false
canBeInterrupted=false
meta.alertId=test-alert-1
meta.provider=test
visual.module=alert_system
visual.eventId=test-alert-1
durationSource=ffprobe
outputTarget=device
```

## Wichtiges Betriebsproblem / Lösung

Im aktiven Modulordner darf keine `.js`-Backup-Datei liegen.

Problem war:

```txt
D:\Streaming\stramAssets\backend\modules\sound_system.backup_before_core_policy.js
```

Da `backend/server.js` alle `.js` Dateien aus `backend/modules` lädt, wurde die Backup-Datei als echtes Modul geladen und registrierte alte `/api/sound/...` Routen.

Regel ab jetzt:

```txt
Backups niemals mit .js-Endung direkt in backend/modules liegen lassen.
Stattdessen .bak verwenden oder außerhalb von backend/modules ablegen.
```

## Alert-System ist noch nicht angebunden

Noch nicht geändert:

```txt
backend/modules/alert_system.js
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

Alert-Core-Test ohne echte Alert-Anbindung:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&volume=100&category=alert&source=alert_system&meta={%22alertId%22:%22test-alert-1%22,%22provider%22:%22test%22}&visual={%22module%22:%22alert_system%22,%22eventId%22:%22test-alert-1%22}" | ConvertTo-Json -Depth 20
```

Reset:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/reset" -Method POST
```

## Nächster empfohlener Step

1. Backup-Branch weiter behalten:

```txt
origin/backup/dev-before-sound-duration-parallel-policy
```

2. Als nächstes Alert-System-Anbindung planen:

```txt
- Alert-Regel findet Sound-Daten
- Alert-System übergibt Sound-Item mit category=alert, meta und visual ans Sound-System
- Alert-System zeigt den visuellen Alert erst auf item_started / passendes alertId/eventId
```

3. Danach Dashboard-Regelbearbeitung für Priorität/Parallel/Interrupt vorbereiten.
