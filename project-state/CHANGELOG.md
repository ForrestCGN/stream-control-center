# CHANGELOG – Event-System EVS52.26

Stand: 2026-06-19

## STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW

Geändert:

- `backend/modules/stream_events.js`
- Modulversion erhöht auf `0.5.92`
- Modulbuild gesetzt auf `STEP_EVS52_26_WINNER_FINALE_NULLSAFE_PREVIEW`
- `winnerFinaleActivitySummary()` null-safe gemacht

Behoben:

- Finale-Preview crashte bei frisch beendetem Event ohne vorhandenes `winnerFinale`.
- Fehler war:

```text
Cannot read properties of null (reading 'startedAt')
```

Auswirkung vor dem Fix:

- `GET /api/stream-events/events/:eventUid/finale` crashte.
- `POST /api/stream-events/events/:eventUid/finale/start?confirm=1` crashte.
- Dashboard bekam keine Finale-Preview.
- Button `Auswertung starten` wurde nicht angezeigt.

Bestätigt nach Fix:

- `GET /api/stream-events/events/evs_event_mqkyu4hp_27b0cb030fad/finale` liefert `ok:true`.
- Ranking wird geliefert.
- `canStartFinale:true`.
- `dashboardCanStartFinale:true`.

Nicht geändert:

- keine DB
- kein Dashboard
- kein Overlay
- kein Sound-System
- keine Reveal-Video-Queue-Logik
- keine Random-Rotation
- kein Ranking
- kein Replay-Flow

## Kontext zu EVS52.21/EVS52.22/EVS52.25

Die Doku enthielt widersprüchliche Restore-Hinweise zwischen EVS52.21/EVS52.19 und EVS52.22B. Der aktuelle echte Backendstand war vor EVS52.26 bereits:

```text
moduleVersion: 0.5.91
moduleBuild: STEP_EVS52_25_SOUND_REVEAL_RANDOM_FIX
```

Deshalb wurde nicht zurückgerollt. EVS52.26 ist ein minimaler Fix auf Basis des echten Live-Backends.
