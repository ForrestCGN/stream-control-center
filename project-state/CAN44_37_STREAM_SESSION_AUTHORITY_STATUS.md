# CAN44.37 Stream Session Authority - Status

Stand: gebaut in Chat.

## Zweck

Zentrale StreamSession-Wahrheit fuer Twitch-Events, AutoShoutout und spaetere Module.

## Kernpunkte

- `twitch_events` fuehrt zentrale `streamState` + `streamSession`.
- Streamtag wird ueber StreamSession/Streamstart gehalten, nicht ueber Kalendertag.
- `calendarDay` und `streamDateLabel` sind getrennt sichtbar.
- OBS kann Pending-Session starten.
- Twitch streamId bestaetigt echte Live-Session.
- OBS/Twitch-Ausfall geht in Grace/Reconnect, nicht sofort `closed`.
- Bandbreitentest kann als `bandwidth_test` markiert werden und erzeugt keinen echten StreamDay.
- AutoShoutout bevorzugt Bus-StreamState von `twitch_events` und legt bei zentralem offline/pending/reconnect/ending/closed/bandwidth_test keinen Fallback-StreamDay an.

## Dateien

- `backend/modules/twitch_events.js`
- `backend/modules/clip_shoutout.js`

## Versionen

- `twitch_events` 0.1.9 / CAN44.37_STREAM_SESSION_AUTHORITY
- `clip_shoutout` 0.2.49

## Nach Deploy pruefen

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$t.diagnostics.streamState | ConvertTo-Json -Depth 10

$ss = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-session?refresh=1"
$ss.streamSession | ConvertTo-Json -Depth 10

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s.moduleVersion
$s.autoShoutout.state.streamState
```
