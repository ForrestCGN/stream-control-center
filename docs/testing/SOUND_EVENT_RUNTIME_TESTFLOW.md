# Testflow – EventSound Runtime

Stand: 2026-06-17

## Voraussetzung

```text
ZIP nach D:\Git\stream-control-center entpacken, wenn Repo-Pfade-ZIP.
Deploy/Live aktualisieren.
StepDone ausführen.
Backend neu starten, falls Node nicht automatisch neu lädt.
OBS-Browserquellen refreshen.
```

## Version prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object moduleVersion,moduleBuild | Format-List
```

## Test 1 – mit Lösung / 30s Counter

Script:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File "$env:USERPROFILE\Downloads\EVENT_RUNTIME_DIAG_DELAYED_ANSWER_30S.ps1"
```

Erwartung:

```text
3 / 2 / 1 / LOS
Sound läuft ohne JETZT RATEN
Counter oben rechts startet nach Sound-Ende
Script wartet ca. 30 Sekunden
Script sendet richtige Antwort
Counter verschwindet
Gewinner-Card erscheint
Reveal startet danach über Sound-System-Overlay
```

## Test 2 – ohne Lösung / Timeout

Script:

```powershell
cd D:\Git\stream-control-center
powershell -ExecutionPolicy Bypass -File ".\tools\test_event_runtime_unresolved_card.ps1"
```

Erwartung:

```text
3 / 2 / 1 / LOS
Sound läuft ohne JETZT RATEN
Counter oben rechts startet nach Sound-Ende
Keine Antwort wird gesendet
Counter läuft bis 0
Keine-Lösung-Kachel oben mittig ca. 10 Sekunden
kein Reveal
```

## Test 3 – Gewinner-Layout langer Name/Titel

Kein Sound-Test nötig. Direkt öffnen:

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html?demo=result-long&v=test
```

Prüfen:

```text
- langer Name lesbar
- Punkte sichtbar
- Titel zweizeilig sauber begrenzt
- Card bricht nicht aus
```

## Diagnose bei Problemen

### Counter fehlt

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/runtime-overlay/state" | ConvertTo-Json -Depth 12
```

Prüfen:

```text
answerWindow.active muss true sein.
Wenn false: Backend-State/Antwortfenster prüfen, nicht Overlay-Design.
```

### Reveal unsichtbar

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=10" | ConvertTo-Json -Depth 12
```

Prüfen:

```text
status
mediaType=video
hasVideo=true
outputTarget=overlay
file/audioUrl/videoUrl
```

OBS-Quelle prüfen:

```text
http://127.0.0.1:8080/overlays/sound_system_overlay.html
```

### Alte Anzeige sichtbar

```powershell
Select-String -Path "D:\Git\stream-control-center\htdocs\overlays\stream_events\event_runtime_overlay.html" -Pattern "version|0.3.7|result-long|answer-counter|KEINE LÖSUNG"
Select-String -Path "D:\Streaming\stramAssets\htdocs\overlays\stream_events\event_runtime_overlay.html" -Pattern "version|0.3.7|result-long|answer-counter|KEINE LÖSUNG"
```
