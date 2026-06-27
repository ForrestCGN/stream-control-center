# Handoff – EVS52.19 Winner Finale Manual End

Stand: Gewinner-Finale wird nicht mehr zeitgesteuert ausgeblendet. Es bleibt sichtbar, bis Forrest es im Dashboard manuell beendet.

## Änderungen

### Backend

- `backend/modules/stream_events.js`
- Version: `0.5.89`
- Build: `STEP_EVS52_19_WINNER_FINALE_MANUAL_END`
- `winnerFinale.active=true` bei Start/Replay.
- `winnerFinale.active=false`, `endedAt`, `hiddenAt` bei manuellem Beenden.
- Neuer Endpoint:
  - `POST /api/stream-events/events/:eventUid/finale/end?confirm=1`
- Finale-Preview liefert:
  - `finaleActive`
  - `dashboardCanEndFinale`
  - `finaleActivity`
  - `finaleEligibility.canEnd`

### Dashboard

- `htdocs/dashboard/modules/stream_events.js`
- Wenn Finale startbar: `🏆 Auswertung starten`.
- Wenn Finale aktiv: `⏹ Finale beenden`.
- Finale beenden ruft den neuen Backend-Endpunkt auf.

### Overlay

- `htdocs/overlays/stream_events/event_winner_overlay.html`
- Version: `0.5.40`
- Step: `EVS52.19`
- Overlay blendet nicht mehr wegen leerem Latest-/Poll-Ergebnis aus.
- Ausblenden nur noch bei explizitem Hide-/Ende-Event.

## Test

```powershell
$eventUid = "evs_event_mqjp25n9_afdd14be3c4a"
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/events/$eventUid/finale/start?confirm=1" -Body "{}" -ContentType "application/json"
```

Danach im Dashboard `⏹ Finale beenden` oder:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/events/$eventUid/finale/end?confirm=1" -Body "{}" -ContentType "application/json"
```
