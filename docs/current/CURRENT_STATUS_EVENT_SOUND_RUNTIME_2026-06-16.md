# Current Status – EventSound Runtime / Sound-System

Stand: 2026-06-17  
Projekt: `stream-control-center`  
Bereich: Eventsystem, Sound-System, Runtime-/Countdown-Overlay, Sound-Dashboard

## Aktueller bestätigter Stand

Das EventSound-/Sound-System ist im gemischten Test bestätigt:

- EventSound nutzt echte Media-Snippets aus der Media-Registry.
- Beispiel bestätigt: `Alf 5 sek`.
- Sound ist hörbar.
- Runtime-/Countdown-Overlay ist sichtbar.
- Sound-System bleibt Owner für Playback, Queue, Gating, Ausgabe und Pause.
- Eventsystem/Runtime-Overlay startet keinen Sound direkt.
- Globale 2-Sekunden-Pause nach jedem Sound funktioniert.
- Queue startet erst nach Gap-Ende weiter.
- Recent Playback Log trennt jetzt echte Audiozeit und Gap sauber.
- Sound-Dashboard zeigt globale Sound-Pause und Verlauf/Zuletzt gespielt.

## Aktuelle Modulstände

| Modul/Datei | Version | Build/Stand |
|---|---:|---|
| `backend/modules/stream_events.js` | `0.5.36` | `STEP_EVENT_SOUND_5B_OUTPUT_TARGET_CONFIG` |
| `backend/modules/sound_system.js` | `0.1.30` | `STEP_SOUND_GAP_2_PLAYBACK_LOG_AUDIO_END_AND_GAP_END` |
| `htdocs/overlays/stream_events/event_runtime_overlay.html` | `0.2.6` | `EVENT-SOUND-5C Runtime Overlay PreRoll-Fallback` |
| `htdocs/dashboard/modules/sound.js` | Dashboard-Modul | `SOUND-DASH-2B_RECENT_PLAYBACK_BADGE_UX` |

## Bestätigte Steps seit 2026-06-16

### SOUND-DASH-1

Sound-Dashboard unter `System -> Sound-System` zeigt globale Sound-Pause und Recent Playback / Zuletzt gespielt.

### SOUND-DASH-1B

Backend-Status bereinigt:

- `dashboardTodo` aus öffentlichem Sound-Status entfernt.
- `postPlaybackGap`, `playbackLog`, `config.soundGap`, `config.playbackLog` sauber.
- Version: `sound_system 0.1.29 / STEP_SOUND_DASH_1_BACKEND_STATUS_CLEANUP`.

### SOUND-GAP-2

Recent Playback trennt jetzt:

```text
startedAt
audioEndedAt
gapStartedAt
gapEndedAt
finishedAt
playbackMs
gapMs
```

Hinweis: `finishedAt` entspricht aktuell dem Ende der Gap. `audioEndedAt` ist der echte Audio-Endzeitpunkt.

### SOUND-DASH-2 / 2B

Dashboard wurde an die neuen Felder angepasst:

- `Audio-Ende`
- `Gap-Ende`
- `Audio`
- `Gap`
- Badge im Verlauf heißt `Verlauf aktiv` statt missverständlich `Aktiv`.

## Gemischter Test – bestätigt

Recent Playback bestätigte saubere Reihenfolge und 2s Gap:

```text
GifSub 1-4      Audio 19,3 s   Gap 2 s
100-249 Bits    Audio 15,4 s   Gap 2 s
Mädchen         Audio 9,4 s    Gap 2 s
Husten          Audio 2,4 s    Gap 2 s
```

Beispiel Gap:

```text
audioEndedAt : 2026-06-17T04:53:34.462Z
gapStartedAt : 2026-06-17T04:53:34.462Z
gapEndedAt   : 2026-06-17T04:53:36.476Z
gapMs        : 2014
```

## Wichtige Entscheidungen

- Sound-System bleibt Playback-/Queue-/Gating-/Pause-/Ausgabe-Owner.
- Eventsystem/Runtime-Overlay darf Sound nicht direkt starten.
- EventSound setzt nicht hart `outputTarget=overlay`, sondern nutzt Sound-System-Config/Default.
- Runtime-Overlay zeigt nur Status/Countdown/Guessing/Result.

## Wichtige Endpunkte

```text
GET /api/sound/status
GET /api/sound/eventbus/status
GET /api/sound/event-preroll/status
GET /api/sound/recent-playback?limit=20
GET /api/stream-events/sound-runtime/status
GET /api/stream-events/runtime-overlay/state
POST /api/stream-events/sound-runtime/reset-test-state?confirm=1
POST /api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1
POST /api/stream-events/sound-runtime/next-round?play=1&confirm=1
```

## Dashboard-Pfad

```text
Dashboard -> System -> Sound-System
```

Dort sichtbar:

- Globale Sound-Pause
- Zuletzt gespielt

## Aktuell offene Punkte

- Globale Sound-Pause im Dashboard später editierbar machen, nicht nur sichtbar.
- Filter im Recent Playback ergänzen: Alerts, Channelpoints/UserSounds, EventSound, Fehler.
- EventSound-Konfiguration im Dashboard aufbauen: Snippets, Countdown, Antwortzeit, Rotation, Ergebnisverhalten.
- Runtime-Overlay Ergebnis-/Auswertungsphase ausbauen.
- Reveal-Video nach erkanntem Sound über vorhandenes Media-System planen.
- Recent Playback ist aktuell Runtime-Verlauf; Persistenz nach Neustart später entscheiden.
