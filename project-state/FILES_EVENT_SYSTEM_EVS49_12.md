# FILES_EVENT_SYSTEM_EVS49_12

Stand: 2026-06-18

## Relevante Projektdateien

### Overlay
`htdocs/overlays/stream_events/event_winner_overlay.html`

Aktueller Arbeitsbereich:
- Winner-Finale-Overlay
- Demo-Modi
- Finale-Rendering
- Raster-/Boxen-Debug
- Slot-Schablonen in EVS49.12 begonnen

### Hintergrundgrafik
`htdocs/assets/stream_events/winner_finale_bg_1920x1080.png`

Hinweis:
- Raster-/PNG-Hintergrund.
- Muss 1920×1080 sein.
- Keine KI-Neugenerierung mehr für heute.
- Bei Skalierung/Mapping auf echte PNG-Größe achten.

## Debug-/Test-URLs

### Status
`http://127.0.0.1:8080/api/stream-events/status`

### Sound-Runtime Report
`http://127.0.0.1:8080/api/stream-events/sound-runtime/report?eventUid=evs_event_mqi781rt_f19c50c6c409`

### Winner Overlay
`http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html`

### Demo Langnamen
`http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?demo=long&state=final`

### Boxenmodus
`http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?debug=boxes`

### Boxen + Raster
`http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?debug=boxes&grid=1`

## Aktiver Test-Event
`evs_event_mqi781rt_f19c50c6c409`

Name:
`1.Kopie von Kopie von 1 Jahr Twitch`
