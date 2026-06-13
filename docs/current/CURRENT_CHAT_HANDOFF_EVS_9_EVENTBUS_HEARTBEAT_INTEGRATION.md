# CURRENT CHAT HANDOFF – EVS-9 EventBus / Heartbeat Integration

## Stand

EVS-9 baut auf EVS-8 auf und macht die EventBus-/Heartbeat-Anbindung von `stream_events` als eigenen Backend-Step sichtbar.

## Geaenderte Datei

- `backend/modules/stream_events.js`

## Doku/Projektdateien

- `docs/modules/stream_events.md`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS_9_EVENTBUS_HEARTBEAT_INTEGRATION.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`

## Umsetzung

- `stream_events` nutzt den vorhandenen `communication_bus`.
- Kein neuer Bus, keine Parallelstruktur.
- Modul-Anmeldung und Heartbeat laufen ueber den bestehenden Bus.
- Status-Publish wird bei wichtigen Aktionen ausgelöst.
- Neuer Diagnose-Endpunkt: `GET /api/stream-events/bus-status`.

## Was bewusst nicht enthalten ist

- Keine Chat-Runtime.
- Keine Twitch-Chat-Auswertung.
- Keine Sound-Rotation.
- Keine Worterkennung.
- Keine automatische Punktevergabe.
- Kein Overlay.
- Kein Playback.

## Tests

```powershell
node -c .ackend\modules\stream_events.js
.\stepdone.cmd "EVS-9 EventBus Heartbeat Integration"
```

Danach optional pruefen:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/status
Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/bus-status
Invoke-RestMethod http://127.0.0.1:8080/api/communication/status
```
