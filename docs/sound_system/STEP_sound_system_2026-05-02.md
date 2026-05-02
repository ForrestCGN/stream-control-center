# Sound-System STEP – 2026-05-02

## Status

Dieser Stand beschreibt den aktuellen Sound-System-/Alert-Handoff-Zwischenstand auf Branch `dev`.

Der Stand umfasst:

```txt
- Sound-System mit Device-Ausgabe über AudioDeviceHelper
- echte Sounddauer per ffprobe
- dynamischer Helper-Timeout für lange Sounds
- Prioritäts-/Queue-Policy
- Alert-System-Handoff an das Sound-System
- visuelle Alert-Synchronisierung über item_starting + visualLeadMs
- getrennte Dashboard-Vorschau und Live-Test-Buttons
```

## Wichtige Commits dieses Arbeitsblocks

```txt
d625421 Apply sound core priority policy
430bcdf Prepare alert visual lead sync
79d3904 Add alert live sound handoff
```

Weitere relevante Commits aus dem Sound-System-Aufbau:

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
73ccf85 Align sound output helper defaults
93cfa32 Show sound queue policy and alert sync state in dashboard
8639360 Prepare sound priority and alert sync policy config
```

Hinweis: Falls weitere lokale Commits nach diesem Dokument erstellt wurden, `git log --oneline -10` prüfen und diese Liste ergänzen.

## Wichtige Dateien

```txt
backend/modules/sound_system.js
backend/modules/alert_system.js
backend/modules/sound_output_config.js
backend/modules/helpers/helper_media.js
config/sound_system.json
htdocs/dashboard/modules/sound.js
htdocs/dashboard/modules/sound.css
htdocs/dashboard/modules/alerts.js
htdocs/overlays/sound_system_overlay.html
htdocs/overlays/_overlay-alerts-v2.html
tools/audio-device-helper/Program.cs
tools/audio-device-helper/AudioDeviceHelper.csproj
tools/audio-device-helper/build-helper.ps1
docs/sound_system/STEP_sound_system_2026-05-02.md
```

## Aktueller getesteter Sound-System-Stand

- AudioDeviceHelper funktioniert.
- Direkte Ausgabe auf Windows-Audiogeräte funktioniert.
- Getestetes Gerät: `Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)`.
- Getestete Device-ID: `{0.0.0.00000000}.{d2b8e581-1cae-48b9-9b2a-deb3d488b356}`.
- WASAPI funktioniert für Voicemeeter AUX.
- Echte Sounddauer wird per `ffprobe` über `helper_media.getAudioInfo()` ermittelt.
- Lange Sounds brechen nicht mehr wegen Helper-Timeout ab.
- Dynamischer Helper-Timeout funktioniert.
- Queue funktioniert.
- Alert-Sounds werden mit `category=alert` und Priorität `80` korrekt hinter laufende Sounds eingereiht.
- Parallel-Sounds sind vorbereitet.
- Dashboard-Ausgabe-Modus funktioniert mit `overlay`, `device` und `both`.

## Aktuelle Sound-Ausgabe-Logik

Ausgabe-Modi:

```txt
Overlay / OBS
Audiogerät
Beides
```

Interne Speicherlogik:

```txt
Overlay / OBS:
  output.defaultTarget=overlay
  output.targets.overlay.enabled=true
  output.targets.device.enabled=false
  output.targets.both.enabled=false

Audiogerät:
  output.defaultTarget=device
  output.targets.overlay.enabled=false
  output.targets.device.enabled=true
  output.targets.both.enabled=false

Beides:
  output.defaultTarget=both
  output.targets.overlay.enabled=true
  output.targets.device.enabled=true
  output.targets.both.enabled=true
```

Aktuell getestetes Device:

```txt
selectedDeviceName: Voicemeeter AUX Input (VB-Audio Voicemeeter VAIO)
selectedDeviceId: {0.0.0.00000000}.{d2b8e581-1cae-48b9-9b2a-deb3d488b356}
playbackMode: auto / WASAPI erfolgreich
```

## Queue-/Priority-Policy

`config/sound_system.json` steht auf Version `0.1.8`.

Wichtige Queue-Felder:

```txt
queue.sortByPriority=true
queue.enabled=true
queue.maxLength=50
queue.dropWhenFull=true
queue.allowParallel=true
queue.maxParallel=3
queue.parallelCategories=[system, admin, ui, test]
queue.alertSync.enabled=true
queue.alertSync.visualLeadMs=150
queue.alertSync.maxVisualLeadMs=500
```

Prioritätsidee:

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
category=alert
priority=80
canInterrupt=false
canBeInterrupted=false
queueIfBusy=true
dropIfBusy=false
parallelAllowed=false
```

Gewünschtes Verhalten:

```txt
Normale Alerts unterbrechen keine laufenden Sounds/Lieder.
Alerts werden nach Priorität in die Sound-Queue einsortiert.
Wenn ein Alert-Sound-Item später dran ist, wird der visuelle Alert synchron dazu angezeigt.
```

## Alert-System-Handoff an Sound-System

Aktueller Ablauf bei Live-Alerts mit Sound:

```txt
1. Alert-System erzeugt das Alert-Event.
2. Alert-System sendet event=prepare ans Alert-Overlay.
3. Alert-System ruft /api/sound/play auf.
4. Sound-System sortiert/queued das Sound-Item nach Priorität.
5. Wenn das Alert-Sound-Item dran ist, sendet Sound-System item_starting.
6. Alert-Overlay zeigt den vorbereiteten Alert bei item_starting.
7. Sound-System wartet visualLeadMs, aktuell 150 ms.
8. Sound startet über das konfigurierte OutputTarget, aktuell meist device.
9. Danach sendet Sound-System item_started.
```

Wichtig:

```txt
Sound soll nicht vor dem Overlay starten.
Overlay soll möglichst gleichzeitig oder minimal vor dem Sound erscheinen.
Deshalb item_starting + visualLeadMs=150.
```

Beispiel eines Alert-Sound-Items in der Queue:

```txt
category=alert
priority=80
source=alert_system
outputTarget=device
meta.alertId=<alert-event-id>
meta.provider=twitch
meta.type=bits
visual.module=alert_system
visual.eventId=<alert-event-id>
```

## Dashboard-Vorschau vs. Live-Test

In `htdocs/dashboard/modules/alerts.js` sind lokale Vorschau und Live-Test getrennt.

Regel-Liste:

```txt
👁 Lokale Vorschau
● Live-Test in OBS
✎ Bearbeiten
× Löschen
```

### 👁 Lokale Vorschau

Soll-Zustand:

```txt
- läuft nur auf dem Rechner des Bearbeiters
- öffnet lokales Popout mit /overlays/_overlay-alerts-v2.html?preview=1
- spielt den Sound lokal über den Dashboard-Browser mit playSoundUrl(...)
- kein OBS
- keine Alert-Queue
- kein Sound-System
- kein Voicemeeter
```

Wichtig: Der lokale Vorschau-Sound wird bewusst vom Dashboard selbst abgespielt, nicht vom Overlay-Iframe. Das verhindert Browser-/Iframe-Autoplay-Probleme.

### ● Live-Test in OBS

Soll-Zustand:

```txt
- fragt vorher per confirm() nach
- nutzt /api/alerts/test mit mode=live und isTest=true
- läuft durch echte Alert-System- und Sound-System-Pipeline
- OBS-Overlay zeigt den Alert
- Sound läuft über konfiguriertes OutputTarget, z. B. device/Voicemeeter
```

## Aktuelle API-Endpunkte Sound-System

```txt
GET  /api/sound/status
GET  /api/sound/list
GET  /api/sound/devices
POST /api/sound/devices/select
GET  /api/sound/play
POST /api/sound/play
POST /api/sound/output
POST /api/sound/reload
POST /api/sound/stop
POST /api/sound/skip
POST /api/sound/clear
POST /api/sound/reset
```

## Aktuelle API-Endpunkte Alert-System, relevant für diesen Stand

```txt
GET  /api/alerts/status
POST /api/alerts/settings
POST /api/alerts/test
POST /api/alerts/clear
POST /api/alerts/reload
GET  /api/alerts/rules
GET  /api/alerts/assets
GET  /api/alerts/text-variants
GET  /api/alerts/chat-blocks
GET  /api/alerts/test-presets
GET  /api/alerts/display-profiles
```

## Getestete PowerShell-Befehle

Sound-Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 20
```

Alert-Status:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status" | ConvertTo-Json -Depth 20
```

Alert-Sound-Handoff aktiv prüfen:

```powershell
(Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/status").config.liveAlert | ConvertTo-Json -Depth 10
```

Erwartung:

```txt
soundSystemEnabled=true
soundSystemOutputTarget=device
soundSystemCategory=alert
soundSystemSource=alert_system
```

Kurzer Device-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=opa01.mp3&outputTarget=device&volume=100" | ConvertTo-Json -Depth 20
```

Langer Device-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/play?file=crew%2FAraglor%20Immer%20Dabei.mp3&outputTarget=device&volume=100&category=fun" | ConvertTo-Json -Depth 20
```

Alert während laufendem Lied einreihen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch/bits?user=ForrestCGN&userLogin=forrestcgn&amount=100&message=Sound-System-Sync-Test" | ConvertTo-Json -Depth 20
```

Erwartung während das Lied läuft:

```txt
current.category=fun
queue[0].category=alert
queue[0].priority=80
queue[0].source=alert_system
queue[0].visual.module=alert_system
```

Skip-Test:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/skip" -Method POST | ConvertTo-Json -Depth 20
```

Reset:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/reset" -Method POST | ConvertTo-Json -Depth 20
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

## Aktive Pfad-Regel für Dashboard-Module

Für dieses Projekt gilt aktuell:

```txt
Repo-Pfad:
D:\Git\stream-control-center\htdocs\dashboard\modules\*.js

Live-Pfad:
D:\Streaming\stramAssets\htdocs\dashboard\modules\*.js
```

Wichtig: Nicht versehentlich nach `D:\Streaming\stramAssets\dashboard\modules\` patchen, wenn die aktive Webauslieferung über `htdocs/dashboard/modules/` läuft.

## Aktuell offene Punkte

Kurzfristig:

```txt
- git status prüfen und sicherstellen, dass alle Live-Fixes auf origin/dev gepusht sind
- Device-Stop-/Skip-Verhalten nach jedem Sound-System-Fix kurz testen
- finale STABLE-/Projektdatei für Sound-System + Alert-Handoff erstellen
```

Später:

```txt
- Sound-/Alert-Konfiguration im Dashboard ausbauen
- liveAlert.soundSystemEnabled und OutputTarget sauber im Dashboard editierbar machen
- Prioritäten/Parallel/Interrupt-Regeln editierbar machen
- Rollen/Rechte für Live-Test-Button absichern
- Config optional schrittweise Richtung SQLite/Runtime-Settings bringen
- Discord-Ausgabe über Sound-System planen
```

## Nächster empfohlener Step

1. `git status` lokal prüfen.
2. Falls sauber: STABLE-/Projektdatei erstellen.
3. Danach Sound-System-Dashboard um konfigurierbare Policy-Werte erweitern.
