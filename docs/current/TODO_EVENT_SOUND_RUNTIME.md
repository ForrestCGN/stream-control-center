# TODO – EventSound Runtime / Sound-System

Stand: 2026-06-17

## Erledigt seit 2026-06-16

- Sound-System Dashboard zeigt globale Sound-Pause sichtbar an.
- Sound-System Dashboard zeigt Recent Playback / „Zuletzt gespielt“ sichtbar an.
- Recent Playback trennt echte Audiozeit und Gap: `audioEndedAt`, `gapStartedAt`, `gapEndedAt`, `playbackMs`, `gapMs`.
- Backend-Status wurde bereinigt; `dashboardTodo` ist aus öffentlichem Sound-Status entfernt.
- Gemischter Test mit Alerts, Channelpoints/UserSounds und EventSound bestätigt: Queue startet erst nach 2s Gap weiter.

## Noch offen

### Sound-System

- Pause zwischen Sounds im Dashboard editierbar machen.
- Recent Playback um Filter erweitern: alle, Alerts, Channelpoints/UserSounds, EventSound, Fehler.
- Optional Detail-Modal pro Playback-Eintrag.
- Optional Persistenz nach Neustart prüfen.

### EventSound

- EventSound-Konfiguration ins Dashboard bringen.
- Sound-Snippet-Auswahl aus Media-System.
- Countdown-Sekunden, Antwortzeit, Rotation und Verhalten nach erkannter/nicht erkannter Runde konfigurierbar machen.
- Ausgabeziel weiterhin vom Sound-System steuern lassen, nicht hart im Eventsystem.

### Runtime-Overlay

- Ergebnis-/Auswertungsphase ausbauen.
- Texte/Position/Countdown später vorsichtig und streamerfreundlich konfigurierbar machen.
- Reveal-Video nach korrekter Lösung über vorhandenes Media-System planen.

## Nicht vergessen

Eventsystem/Runtime-Overlay darf Sound nicht direkt starten. Sound-System bleibt Owner für Playback, Queue, Gating, Pause und Ausgabe.
