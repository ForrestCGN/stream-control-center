# STEP272B1 - Sound-Pegel Test-Ton ueber OBS/Sound-System

Stand: 2026-05-21

## Ziel

Der technische Referenz-Testton im Sound-Pegel-Dashboard soll nicht nur direkt als WAV im Browser abgespielt werden, sondern ueber den normalen Sound-System-/OBS-Overlay-Pfad laufen.

## Geaendert

```text
htdocs/dashboard/modules/sound_levelscan.js
project-state/STEP272B1_SOUND_PEGEL_TESTTON_OBS.md
```

## Funktion

- Button im Referenz-Tab heisst jetzt `Test-Ton ueber OBS`.
- Der Button ruft zentral `/api/sound/play` auf.
- Der Test-Ton nutzt `type=generated_beep` und `outputTarget=overlay`.
- Damit laeuft der Ton ueber das Sound-System und den OBS-Overlay-Pfad.
- Der direkte `Test-WAV oeffnen`-Link bleibt nur zum Gegenhoeren erhalten.

## Bewusst unveraendert

```text
backend/modules/sound_system.js
backend/modules/sound_loudness_scanner.js
Sound-Dateien
Sound-Queue
Discord-Routing
Alert-Bundle-Lock
TTS-System
config/**
app.sqlite
```

## Test

```powershell
node --check htdocs\dashboard\modules\sound_levelscan.js
```

Dashboard:

```text
System -> Sound-Pegel -> Referenz
Test-Ton ueber OBS klicken
OBS/Sound-System-Ausgabe pruefen
Referenzsound abspielen gegenpruefen
```

## Hinweis

Der Test-Ton ist eine technische Orientierung. Fuer das finale Einpegeln bleibt der empfohlene echte Referenzsound wichtiger, weil er das tatsaechliche Alert-/Sound-Material besser repraesentiert.
