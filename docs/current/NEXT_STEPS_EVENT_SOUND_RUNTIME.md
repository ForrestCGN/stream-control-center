# Next Steps – EventSound Runtime / Sound-System

Stand: 2026-06-17

## Aktuell bestätigter Stand

```text
sound_system 0.1.30 / STEP_SOUND_GAP_2_PLAYBACK_LOG_AUDIO_END_AND_GAP_END
stream_events 0.5.36 / STEP_EVENT_SOUND_5B_OUTPUT_TARGET_CONFIG
event_runtime_overlay.html 0.2.6
```

Sound-Dashboard unter `System -> Sound-System` zeigt globale Sound-Pause und Recent Playback inklusive Audio-Ende, Gap-Ende, Audio-Dauer und Gap-Dauer.

## Nächster sinnvoller Entwicklungsstep

### EVENT-SOUND-DASH-1

EventSound im Dashboard konfigurierbar machen.

Ziel:

- bestehende Event-/Stream-Events-Struktur nutzen
- keine parallelen Eventsysteme bauen
- Media-System für Snippet-Auswahl nutzen
- Sound-System bleibt Playback-/Queue-Owner
- Eventsystem darf Ausgabeziel nicht hart setzen

Geplante Bereiche:

- Sound-Snippets aus Media-System auswählen
- Countdown/Antwortzeit setzen
- Verhalten nach richtiger/falscher Antwort konfigurieren
- Spieltyp Sound/Text im Eventeditor sauber kombinierbar machen
- Gültigkeit eines Events nur, wenn gewählte Spieltypen vollständig konfiguriert sind

Vor Umsetzung prüfen:

```text
backend/modules/stream_events.js
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
backend/modules/media*.js / vorhandene Media-Helper
backend/modules/sound_system.js
```

## Danach priorisiert

### SOUND-DASH-3

- Filter im Recent Playback
- Fehler/failed besser sichtbar
- ggf. Detail-Modal pro Playback-Eintrag
- Pause zwischen Sounds später editierbar machen

### EVENT-RUNTIME-RESULT-1

- richtig erkannt
- nicht erkannt
- Top 3 / Punkte später
- Reveal optional

### EVENT-REVEAL-MEDIA-1

- vorhandenes Media-System nutzen
- kein Direktplay am Sound-System vorbei
- Reihenfolge mit Sound-Gap/Queue abstimmen

## Testbefehle

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild
$s.postPlaybackGap
$s.playbackLog

$log = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=20"
$log.items | Select-Object startedAt,audioEndedAt,gapStartedAt,gapEndedAt,finishedAt,status,soundId,label,source,category,playbackMs,gapMs | Format-Table -AutoSize
```
