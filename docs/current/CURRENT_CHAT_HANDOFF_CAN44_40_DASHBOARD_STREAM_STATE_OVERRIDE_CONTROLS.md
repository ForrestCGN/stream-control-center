# CAN44.40 Dashboard Stream-State Override Controls

## Ziel
Der Live-Status-Monitor bekommt Dashboard-Buttons für den vorhandenen Manual Override des zentralen Twitch-Events Stream-State Providers.

## Dateien
- `backend/modules/twitch_events.js`
- `htdocs/dashboard/modules/live_status_monitor.js`
- `htdocs/dashboard/modules/live_status_monitor.css`

## Änderungen
- `twitch_events` Version 0.1.12 / Build `CAN44.40_DASHBOARD_STREAM_OVERRIDE`.
- Override-Route akzeptiert jetzt `forceConfirmed`/`confirmed` und optional `streamId`.
- Dashboard-Buttons:
  - OBS/Pending simulieren
  - Online bestätigt simulieren
  - Offline simulieren
  - Bandbreitentest
  - Override löschen
- TTL-Auswahl: 5, 10 oder 30 Minuten.
- Dashboard zeigt StreamSession/StreamDay/Kalendertag/Streamtag.

## Wichtig
`Online bestätigt simulieren` ist ein Testmodus. Er setzt einen bestätigten manuellen Twitch-Live-Zustand und erzeugt bewusst ein `twitch.stream.online` Test-Event über den Bus. Nach Tests immer `Override löschen` drücken.

## Tests
```powershell
node -c "D:\Streaming\stramAssets\backend\modules\twitch_events.js"
node -c "D:\Streaming\stramAssets\htdocs\dashboard\modules\live_status_monitor.js"

$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$t.moduleVersion
$t.diagnostics.streamState.moduleBuild
```

Erwartung: `0.1.12` und `CAN44.40_DASHBOARD_STREAM_OVERRIDE`.
