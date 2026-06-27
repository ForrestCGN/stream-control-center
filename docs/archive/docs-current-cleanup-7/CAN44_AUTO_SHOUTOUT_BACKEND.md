# CAN-44 Auto-Shoutout Backend

Stand: 2026-06-03

## Enthaltene Dateien

- `backend/modules/clip_shoutout.js`
- `config/clip_system.json`

## Ziel

Das bestehende `clip_shoutout`-Modul bekommt eine erste sichere Auto-Shoutout-Backend-Stufe.

Auto-Shoutout reagiert auf Chat-Aktivität konfigurierter Streamer und reiht dann den bestehenden Video-Shoutout normal in die vorhandene DisplayQueue ein. Der offizielle Twitch-Shoutout läuft danach wie bisher über die vorhandene OfficialQueue.

## Wichtig

- `officialShoutout.liveGateEnabled` bleibt in der Config auf `false`.
- `autoShoutout.onlyWhenLive` ist standardmäßig `false`.
- Der Streamstatus wird angezeigt, blockiert aber den Auto-Shoutout erstmal nicht.
- Keine DB wird ersetzt.
- Bestehende Queue-, Clip-, EventSub- und Official-Shoutout-Logik bleibt erhalten.

## Neue Config

Unter `clipShoutout.autoShoutout`:

```json
{
  "enabled": false,
  "onlyWhenLive": false,
  "triggerOnFirstMessageOnly": true,
  "respectStreamDayLimit": true,
  "globalCooldownMs": 120000,
  "perStreamerCooldownMs": 43200000,
  "sendChatMessage": true,
  "storeSkippedEvents": false,
  "queuedMessage": "📺 @{displayName} ist im Chat — Video-Shoutout wird vorbereitet!",
  "streamers": []
}
```

Beispiel zum Aktivieren:

```json
"streamers": [
  {
    "login": "beispielstreamer",
    "displayName": "BeispielStreamer",
    "enabled": true,
    "officialShoutout": true,
    "videoShoutout": true,
    "note": ""
  }
]
```

## Neue Routen

- `GET /api/clip-shoutout/auto`
- `POST /api/clip-shoutout/auto/test-chat`

## Tests

```powershell
node -c backend\modules\clip_shoutout.js
```

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object ok,module,moduleVersion,enabled
$s.config.autoShoutout | ConvertTo-Json -Depth 8
$s.autoShoutout | ConvertTo-Json -Depth 8
$s.streamStatus | ConvertTo-Json -Depth 8
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto" | ConvertTo-Json -Depth 8
```

Test-Chat ohne echten Twitch-Chat, nur wenn ein Streamer in der Config steht:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/clip-shoutout/auto/test-chat" `
  -ContentType "application/json" `
  -Body '{"login":"beispielstreamer","displayName":"BeispielStreamer","message":"Hallo Chat"}' |
  ConvertTo-Json -Depth 8
```

Danach Queue prüfen:

```powershell
$q = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue"
$q.displayQueue.queue | Select-Object id,target_login,status,available_at,last_error | Format-Table -AutoSize
$q.officialQueue.queue | Select-Object id,target_login,status,available_at,last_error | Format-Table -AutoSize
```

## Noch nicht enthalten

Die sichtbare Dashboard-UI zum komfortablen Bearbeiten der Streamer-Liste ist in diesem Paket noch nicht umgesetzt. Die Backend-/Settings-Grundlage ist vorbereitet, damit das Dashboard im nächsten Schritt sauber darauf zugreifen kann.
