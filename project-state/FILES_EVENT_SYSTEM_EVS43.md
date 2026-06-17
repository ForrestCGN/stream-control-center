# FILES – Event-System EVS43

## Backend

```text
backend/modules/stream_events.js
```

Aktueller Stand nach EVS43:

```text
moduleVersion 0.5.60
moduleBuild STEP_EVENT_RUNTIME_GATE_TWITCH_EVENTS_STREAM_STATE_1
```

## Dashboard

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

Relevante letzte Dashboard-Erweiterungen:

- EVS39: Nächster Schnipsel Anzeige
- EVS39.1: Auto-Reload/Countdown
- EVS41: Winner Finale Foundation Dashboard-Grundlage

## Overlays

```text
htdocs/overlays/stream_events/event_runtime_overlay.html
htdocs/overlays/stream_events/event_winner_overlay.html
```

Winner Overlay Demo:

```text
/overlays/stream_events/event_winner_overlay.html?demo=single&speed=fast
/overlays/stream_events/event_winner_overlay.html?demo=tie&speed=slow
```

## Tools / Tests

```text
tools/test_stream_events_runtime_gate.ps1
tools/test_stream_events_skip_wait.ps1
tools/test_stream_events_recovery.ps1
tools/test_stream_events_stream_offline_pause.ps1
tools/test_stream_events_winner_finale.ps1
tools/test_stream_events_winner_overlay_extended.ps1
```
