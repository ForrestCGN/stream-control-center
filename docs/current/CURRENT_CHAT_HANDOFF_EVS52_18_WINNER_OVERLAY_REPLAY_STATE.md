# CURRENT CHAT HANDOFF – EVS52.18 Winner Overlay Replay State

Stand: 2026-06-18

## Ziel

Das Gewinner-/Finale-Overlay darf ein bereits gestartetes Finale nicht verpassen. Die Auswertung soll ohne Stream-Online-Zwang erneut angezeigt werden können.

## Geändert

- Backend `stream_events` Version `0.5.88`, Build `STEP_EVS52_18_WINNER_OVERLAY_REPLAY_STATE`.
- Neuer Endpoint:
  - `GET /api/stream-events/winner-finale/latest?maxAgeMs=600000`
- Replay eines bestehenden Finales aktualisiert `winnerFinaleLastReplayAt` / `winnerFinaleLastShownAt` und sendet erneut `stream_events.winner_finale/replay_requested`.
- Winner-Overlay Version `0.5.39`, Step `EVS52.18`.
- Normales OBS-Overlay bleibt idle unsichtbar, pollt aber automatisch nach einem frischen gestarteten/replayten Finale.
- Wenn der Bus-Event verpasst wurde, holt das Overlay das frische Finale nach.

## Wichtig

Der Stream muss für die Auswertung nicht online sein.

## OBS-Link

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html
```

Optional mit längerem Replay-Fenster:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?maxAgeMs=900000
```

Gezielter Replay-Link für ein bestimmtes Event:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?eventUid=EVENT_UID&instant=1
```

## Test

1. Finale per Dashboard oder Route starten/replayen:

```powershell
$eventUid = "EVENT_UID"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/events/$eventUid/finale/start?confirm=1" -Body "{}" -ContentType "application/json"
```

2. Overlay normal in OBS offen lassen.
3. Erwartung: Finale wird angezeigt, auch wenn das Overlay den ursprünglichen Bus-Event verpasst hat.
4. Latest prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/winner-finale/latest?maxAgeMs=600000" | ConvertTo-Json -Depth 8
```
