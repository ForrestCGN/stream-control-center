# CHANGELOG – stream-control-center

## 2026-06-18 – EVS52.18 Winner Overlay Replay State

- `stream_events` auf `0.5.88 / STEP_EVS52_18_WINNER_OVERLAY_REPLAY_STATE` erhöht.
- Bestehendes Gewinner-Finale kann erneut angezeigt werden, ohne neu auszulosen.
- Replay aktualisiert `winnerFinaleLastReplayAt` / `winnerFinaleLastShownAt`.
- Neuer Endpoint `GET /api/stream-events/winner-finale/latest` ergänzt.
- Winner-Overlay auf `0.5.39 / EVS52.18` erhöht.
- Overlay bleibt idle unsichtbar, pollt aber automatisch nach frischem Finale und zeigt es an, falls der Bus-Event verpasst wurde.
- Kein Stream-Online-Zwang für Auswertung/Replay.
