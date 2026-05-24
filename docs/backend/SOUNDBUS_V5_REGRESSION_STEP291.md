# SoundBus V5 Regression Test – STEP291

Datum: 2026-05-24T14:10:00Z

## Kurzfazit

Der V5-Real-Queue-/Bundle-Test mit aktivem SoundBus wurde erfolgreich durchgeführt.

Der SoundBus erzeugte Events, ohne die bestehende Queue-/Bundle-Reihenfolge zu verändern.

## Ergebnis

Bestanden mit Warnung:

- Queue-/Bundle-Reihenfolge: bestanden.
- Alert-Bundle-Locks: bestanden.
- Alert-Hauptsound + Alert-TTS-Reihenfolge: bestanden.
- SoundAlert-/ModSound-/NormalTTS-Abgrenzung: bestanden.
- SoundBus-Fehler: 0.
- Device-Fehler: 0.
- Sound-System-Fehler: 0.
- Discord-Fehler: 3, separater Nebenbefund.

## Reihenfolge laut Live-Trace

```text
Alert 1 Sound
Alert 1 TTS
Alert 2 Sound
Alert 2 TTS
Alert 3 Sound
Alert 3 TTS
SoundAlert 1
SoundAlert 2
Mod-Sound Araglor
Mod-Sound Drudchen_CGN
Normal TTS 1
Normal TTS 2
```

## Nebenbefund Discord

Discord konnte im Test einige Media-Registry-Alert-Sounds nicht finden:

```text
sound nicht gefunden: media/alerts/bits/100-249.mp3
```

Das ist vermutlich ein Pfad-/Resolver-Thema zwischen Media-Registry-Dateien und Discord-Player. Der Device-/Stream-Pfad funktionierte, und die SoundBus-Events blieben fehlerfrei.

## Folgeempfehlung

Nächster technischer Block:

**STEP292 – Discord Media Path/Routing Audit**

Ziel:

- Media-Registry-Pfade `media/...` für Discord korrekt auflösen.
- Keine Änderung am SoundBus nötig, solange nicht beim Audit zwingend.
- Keine Queue-/Bundle-Logik anfassen.
