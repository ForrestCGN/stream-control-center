# Next Steps – EventSound Runtime / Sound-System

Stand: 2026-06-16

## Direkt als nächstes testen

1. Allgemeines Sound-System testen:
   - normale UserSounds
   - zwei Sounds direkt hintereinander
   - zwei Alerts hintereinander
   - EventSound danach erneut

2. Mit Recent Playback Log kontrollieren:

```powershell
$log = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=20"
$log.items | Format-Table startedAt,finishedAt,status,soundId,label,source,category,playbackMs,gapMs -AutoSize
```

3. Mischtest planen:
   - einmal EventSound/Overlay
   - zwei Alerts
   - zwei normale Sounds
   - nochmal EventSound/Overlay

## Nächste Entwicklungssteps

### SOUND-DASH-1

Dashboard-Bereich für Sound-System erweitern:

- Pause zwischen Sounds konfigurierbar
- Recent Playback Log anzeigen
- Filter für Alerts/UserSounds/EventSound/Fehler

### EVENT-SOUND-DASH-1

EventSound im Dashboard konfigurierbar machen:

- Sound-Snippets aus Media-System auswählen
- Countdown/Antwortzeit setzen
- Verhalten nach richtiger/falscher Antwort konfigurieren
- Spieltyp Sound/Text im Eventeditor sauber kombinierbar machen

### EVENT-RUNTIME-RESULT-1

Runtime-Overlay für Ergebnis/Auswertung vorbereiten:

- richtig erkannt
- nicht erkannt
- Top 3 / Punkte später
- Reveal optional

### EVENT-REVEAL-MEDIA-1

Reveal-Video nach korrekt erkanntem Sound planen:

- vorhandenes Media-System nutzen
- kein Direktplay am Sound-System vorbei
- Reihenfolge mit Sound-Gap/Queue abstimmen
