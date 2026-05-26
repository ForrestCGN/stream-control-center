# STEP468_STREAM_STATUS_AUTO_REFRESH

## Ziel

Der zentrale `stream_status` aktualisiert sich selbst regelmäßig über die lokale Twitch-API des Node-Backends. Dadurch ist der Stream-Live-Status nicht mehr von Streamer.bot-Dateien abhängig.

## Geänderte Datei

- `backend/modules/stream_status.js`

## Runtime-Version

- `stream_status`: `0.1.2`

## Änderungen

- Twitch-API ist im zentralen `stream_status` jetzt standardmäßig bevorzugte Quelle.
- `twitch_stream_raw.json` und `twitch_live_data.json` bleiben als Fallback/Legacy-Quelle erhalten.
- Auto-Refresh wurde ergänzt:
  - Standard idle/offline: alle 60 Sekunden
  - Standard live/grace: alle 30 Sekunden
- Status wird weiter im RAM und in SQLite gespeichert:
  - `stream_status_state`
  - `stream_status_sessions`
- `getCurrentStatus()` liefert für synchrone Module den letzten zentral gespeicherten Stand und startet bei Bedarf eine asynchrone Aktualisierung, statt den frischen API-Stand wieder mit einer stale Datei zu überschreiben.
- Statusausgabe enthält zusätzliche Auto-Refresh-Felder unter `state`.

## Neue/erweiterte ENV-Optionen

- `STREAM_STATUS_API_FIRST` default `true`
- `STREAM_STATUS_AUTO_REFRESH_ENABLED` default `true`
- `STREAM_STATUS_AUTO_REFRESH_IDLE_MS` default `60000`
- `STREAM_STATUS_AUTO_REFRESH_ACTIVE_MS` default `30000`
- `STREAM_STATUS_CACHE_MAX_AGE_MS` default `15000`

## Bewusst nicht geändert

- `clip_shoutout.js` wurde nicht geändert.
- `!vso` bleibt Testcommand.
- Display-Queue bleibt unverändert.
- Streamtag-Limit bleibt unverändert.
- Timeline bleibt unverändert.
- Keine Dashboard-Änderung.
- Keine Sound-System-Änderung.
- Keine Chatmeldungen geändert.

## Tests

Nach dem Entpacken:

```bat
node --check backend\modules\stream_status.js
.\stepdone.cmd "STEP468 Stream Status Auto Refresh"
```

Backend neu starten.

Danach prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/stream-status/status" | ConvertTo-Json -Depth 10
```

Wichtig sind:

- `moduleVersion: 0.1.2`
- `source: twitch_api`
- `statusKnown: true`
- `stale: false`
- `state.autoRefreshEnabled: true`
- `state.autoRefreshNextRunAt` gesetzt

Shoutout-Gate prüfen:

```powershell
$q = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue"
$q.officialQueue.liveGate | ConvertTo-Json -Depth 10
```

Erwartung offline:

- `source: stream_status`
- `upstreamSource: twitch_api`
- `statusKnown: true`
- `stale: false`
- `live: false`
- `reason: waiting_stream_live_offline`
