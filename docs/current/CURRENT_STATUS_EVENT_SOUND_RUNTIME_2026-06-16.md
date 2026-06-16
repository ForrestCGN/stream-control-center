# Current Status – EventSound Runtime / Sound-System

Stand: 2026-06-16  
Projekt: `stream-control-center`  
Bereich: Eventsystem, Sound-System, Runtime-/Countdown-Overlay

## Aktueller bestätigter Stand

Das EventSound-Testsystem läuft grundsätzlich:

- echtes Media-Snippet wird aus der Media-Registry genutzt
- Sound ist hörbar
- Countdown-/Runtime-Overlay ist sichtbar
- nach Sound-Ende bleibt eine globale 2s Sound-Pause aktiv
- Sound-Queue startet erst nach dieser Pause weiter
- Recent Playback Log ist vorbereitet

## Aktuelle Modulstände

| Modul/Datei | Version | Build/Stand |
|---|---:|---|
| `backend/modules/stream_events.js` | `0.5.36` | `STEP_EVENT_SOUND_5B_OUTPUT_TARGET_CONFIG` |
| `backend/modules/sound_system.js` | `0.1.28` | `STEP_SOUND_LOG_1_RECENT_PLAYBACK_LOG` |
| `htdocs/overlays/stream_events/event_runtime_overlay.html` | `0.2.6` | `EVENT-SOUND-5C Runtime Overlay PreRoll-Fallback` |

## Wichtige Entscheidungen

### Sound-System bleibt Playback-Owner

Das Eventsystem startet Sounds nicht direkt und spielt keine Audiodateien am Sound-System vorbei. Der Ablauf ist:

1. Eventsystem bereitet Sound-Runde vor.
2. Eventsystem sendet kontrollierte Playback-Anfrage an das Sound-System.
3. Sound-System bleibt Gatekeeper für Queue, Ausgabeziel, Playback und Pause.
4. Runtime-Overlay zeigt nur Status/Countdown/Guessing an.

### Ausgabeziel nicht hart im Eventsystem

EventSound setzt nicht mehr hart `outputTarget=overlay`. Stattdessen nutzt es `outputTarget=default`, sodass das Sound-System seine eigene Ausgabe-Konfiguration verwenden kann.

Grund: Overlay-Autoplay kann in OBS/Browser-Kontexten blockieren. Die Ausgabe muss deshalb über das vorhandene Sound-System-Routing laufen.

### 2s Pause nach Sounds

Im Sound-System ist eine globale Pause nach jedem Sound aktiv:

- `postPlaybackGap.durationMs = 2000`
- `blockQueueStart = true`
- `holdEventRuntimeOverlay = true`

Dadurch kann nicht direkt nach Sound-Ende ein neuer Sound starten. Beim EventSound bleibt das Runtime-Overlay während dieser Pause noch eingeblendet.

### Runtime-Overlay PreRoll-Fallback

Da direkte Bus-Zustellung ans Runtime-Overlay zeitweise `deliveredCount: 0` hatte, holt sich das Overlay zusätzlich den aktuellen PreRoll-Status über:

```text
GET /api/sound/event-preroll/status
```

Damit wird der Countdown auch dann sichtbar, wenn direkte Overlay-Bus-Zustellung nicht beim Browserclient ankommt.

## Wichtige Endpunkte

### Sound-System

```text
GET /api/sound/status
GET /api/sound/eventbus/status
GET /api/sound/event-preroll/status
GET /api/sound/recent-playback?limit=20
```

### Eventsystem Sound-Runtime

```text
GET  /api/stream-events/sound-runtime/status
GET  /api/stream-events/runtime-overlay/state
POST /api/stream-events/sound-runtime/reset-test-state?confirm=1
POST /api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1
POST /api/stream-events/sound-runtime/next-round?play=1&confirm=1
```

### Overlay

```text
http://127.0.0.1:8080/overlays/stream_events/event_runtime_overlay.html
```

## Bestätigte Tests

### 4D Test-State Cleanup

```text
stream_events 0.5.34 / STEP_EVENT_SOUND_4D_TEST_STATE_CLEANUP
reset-test-state cleanedCount: 1
activeRound: leer
```

### 5B Ausgabeziel über Sound-System

Ergebnis: Ton wurde gehört. Damit ist bestätigt, dass EventSound nicht mehr am falschen Overlay-Autoplay hängt, sondern über die Sound-System-Konfiguration laufen kann.

### SOUND-GAP-1

```text
sound_system 0.1.27 / STEP_SOUND_GAP_1_POST_PLAYBACK_GAP_EVENT_HOLD
postPlaybackGap.enabled: true
postPlaybackGap.durationMs: 2000
blockQueueStart: true
holdEventRuntimeOverlay: true
dashboardTodo: true
```

### SOUND-LOG-1

Recent Playback Log wurde ergänzt mit:

```text
GET /api/sound/recent-playback
```

## Zuletzt beobachtete Reihenfolge aus Diagnose

Aus dem EventBus war bereits erkennbar:

```text
Gewürzgurke -> Mädchen -> Husten -> Bits -> GiftSub -> Bits
```

Der neue Recent Playback Log soll diese Diagnose lesbarer und dashboardfähig machen.

## Offene Punkte

- Sound-System-Konfiguration für `postPlaybackGapMs` ins Dashboard bringen.
- Sound-System Verlauf / „Zuletzt gespielt“ ins Dashboard bringen.
- EventSound-Konfiguration ins Dashboard bringen: echte Snippets, Countdown, Antwortzeit, Wiederverwendung/Entfernen erkannter Sounds.
- Später Reveal-/Video-Playback nach korrekt erkanntem Sound über vorhandenes Media-System planen.
- Direkte Bus-Zustellung ans Runtime-Overlay später sauber prüfen; aktueller Fallback ist funktional, aber die eigentliche Overlay-Client-Registrierung sollte langfristig robuster werden.
