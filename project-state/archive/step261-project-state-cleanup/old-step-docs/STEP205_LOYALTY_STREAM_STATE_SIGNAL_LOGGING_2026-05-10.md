# STEP205 – Loyalty Stream-State Signal-Logging

Stand: 2026-05-10  
Projekt: stream-control-center  
Branch: dev  
Betroffene Datei: `backend/modules/loyalty.js`

## Ziel

Nach STEP204 startet und stoppt der Loyalty AutoRunner automatisch über `/api/loyalty/stream-state/start` und `/api/loyalty/stream-state/stop`.

Im Test wurde sichtbar, dass ein zweites Online-Signal, z. B. von `twitch_eventsub`, den aktuellen `manual.source` im Stream-State überschreiben konnte, obwohl der eigentliche Start von `streamerbot` kam.

STEP205 verhindert diese unnötige Überschreibung.

## Änderung

`backend/modules/loyalty.js` wurde von Version `0.1.8` auf `0.1.9` erhöht.

Doppelte Stream-State-Signale werden jetzt erkannt:

- Wenn der Stream bereits live ist und erneut `/stream-state/start` kommt, wird der bestehende Stream-State nicht überschrieben.
- Wenn der Stream bereits offline ist und erneut `/stream-state/stop` kommt, wird der bestehende Stream-State nicht überschrieben.
- Der zusätzliche Impuls wird trotzdem in `loyalty_runner_events` geloggt.

Neue Eventtypen:

- `stream_state_start_signal`
- `stream_state_stop_signal`

Diese Events enthalten im Metadata-Bereich:

- `signal.requestedLive`
- `signal.duplicate`
- `signal.preservedExistingState`
- `signal.source`
- `signal.reason`
- `signal.previousManual`
- `previousStreamState`

## Bewusst unverändert

- AutoRunner-Start/Stop-Logik aus STEP204 bleibt erhalten.
- Doppelte Runner werden weiterhin über `alreadyRunning` verhindert.
- Runner-Stop bleibt idempotent.
- Es wurde keine neue Tabelle erstellt.
- Es wurde keine bestehende Funktionalität entfernt.
- SQLite-Schema-Version bleibt unverändert.
- `app.sqlite` wird nicht ersetzt oder neu gebaut.

## Erwartetes Verhalten

### Streamer.bot startet Stream

`/api/loyalty/stream-state/start?source=streamerbot`

Erwartung:

- Stream-State wird live.
- `manual.source` wird `streamerbot`.
- Runner startet automatisch.
- Event `stream_state_started` wird geloggt.

### Twitch meldet danach ebenfalls online

`/api/loyalty/stream-state/start?source=twitch_eventsub`

Erwartung:

- Stream-State bleibt auf ursprünglichem Start-Source, z. B. `streamerbot`.
- Runner wird nicht doppelt gestartet.
- Event `runner_start_already_running` wird geloggt.
- Event `stream_state_start_signal` wird geloggt.

### Streamer.bot stoppt Stream

`/api/loyalty/stream-state/stop?source=streamerbot`

Erwartung:

- Stream-State wird offline.
- Runner stoppt automatisch.
- Event `stream_state_stopped` wird geloggt.

### Doppelter Stop

`/api/loyalty/stream-state/stop?source=twitch_eventsub`

Erwartung:

- Bestehender Offline-State wird nicht überschrieben.
- Runner bleibt gestoppt.
- Event `runner_stop_already_stopped` wird geloggt.
- Event `stream_state_stop_signal` wird geloggt.

## Tests nach Deploy

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=streamerbot&reason=step205_start" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=twitch_eventsub&reason=step205_duplicate_start" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 80
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/stop?source=streamerbot&reason=step205_stop" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/stop?source=twitch_eventsub&reason=step205_duplicate_stop" | ConvertTo-Json -Depth 60
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=30" | ConvertTo-Json -Depth 80
```

## Offene Punkte

- `docs/current/CURRENT_SYSTEM_STATUS.md` sollte nach erfolgreichem Test um STEP205 ergänzt werden, wenn die Datei im Arbeitsstand verfügbar ist.
- Später kann das Signal-Logging im Dashboard sichtbar gemacht werden.
