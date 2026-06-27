# HT3.1 – HypeTrain Overlay Registration & Heartbeat

Ziel: Das vorbereitete HypeTrain-Overlay soll sich beim Backend anmelden und regelmäßig Heartbeats senden. Damit kann später zuverlässig erkannt werden, ob das Overlay in OBS/Browser aktiv ist.

## Enthalten

- `backend/modules/hypetrain.js` Version `0.2.1` / Build `STEP_HT3_1_HYPETRAIN_OVERLAY_REGISTER_HEARTBEAT`
- `htdocs/overlays/hypetrain/hypetrain_overlay.html` mit Register/Heartbeat
- Statusfelder unter `/api/hypetrain/status.overlay`
- eigene Statusroute `/api/hypetrain/overlay/status`

## Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" | Select-Object moduleVersion,moduleBuild
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/overlay/status" | ConvertTo-Json -Depth 5
```

Erwartung nach geöffneter Overlay-Seite:

```text
overlay.registered = true
overlay.connected = true
overlay.lastHeartbeatAt ist gesetzt
```
