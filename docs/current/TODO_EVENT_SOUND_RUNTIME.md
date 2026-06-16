# TODO – EventSound Runtime / Sound-System

Stand: 2026-06-16

## Dashboard-Pflichtpunkte

### Sound-System: Pause zwischen Sounds

Muss später ins Dashboard:

- Einstellung: Pause nach Sound-Ende
- aktueller interner Standard: `2000ms`
- streamerfreundlicher Name: „Pause zwischen Sounds“
- mögliche Werte z. B. 0–10000ms
- Erklärung: verhindert, dass mehrere Sounds direkt aneinanderkleben
- Statusanzeige: aktiv/inaktiv, Restzeit falls gerade Pause läuft

Aktueller Code-Stand:

```text
sound_system.postPlaybackGap.durationMs = 2000
blockQueueStart = true
holdEventRuntimeOverlay = true
```

### Sound-System: Verlauf / Zuletzt gespielt

Muss später ins Dashboard:

- Bereich: Sound-System -> Verlauf / Zuletzt gespielt
- Route: `GET /api/sound/recent-playback`
- anzeigen: Zeit, Soundname, Datei, Quelle, Kategorie, Ausgabeziel, Status, Dauer, Gap
- Filter: alle, Alerts, UserSounds, EventSound, Fehler
- für Debug/Test hilfreich: Reihenfolge und Fehler sichtbar machen

### EventSound: Runtime-Konfiguration

Muss später ins Dashboard:

- Sound-Snippet-Auswahl aus Media-System
- Countdown-Sekunden
- Antwortzeit
- Verhalten nach erkannter Runde:
  - aus Rotation entfernen / als erkannt markieren
  - später erneut einreihen
  - trotz falsch/keine Antwort entfernen
- Ausgabeziel soll weiterhin vom Sound-System gesteuert werden, nicht hart im Eventsystem.

### EventSound: Overlay-Konfiguration

Muss später ins Dashboard:

- Countdown an/aus
- Position/Design nur vorsichtig, CGN-Standard erhalten
- Text für „Jetzt raten!“/„LOS!“ konfigurierbar
- Hold nach Sound-Ende folgt aktuell der Sound-System-Pause

## Technische offene Punkte

- Direkte Bus-Zustellung zum Runtime-Overlay prüfen; aktuell gibt es den funktionalen PreRoll-Fallback über `/api/sound/event-preroll/status`.
- EventSound später mit echtem Event-Editor verbinden statt Test-Route.
- Reveal-Video nach korrekter Lösung über vorhandenes Media-System planen.
- Recent Playback Log ggf. später persistent machen, falls Verlauf nach Neustart erhalten bleiben soll.
- Sound-System-Discord-Routing später für EventSound bewusst entscheiden, nicht nebenbei aktivieren.

## Nicht vergessen

Die 2 Sekunden Pause zwischen Sounds ist aktuell fest/intern vorbereitet. Sie muss in einer späteren Dashboard-/Config-Runde sichtbar und editierbar werden.
