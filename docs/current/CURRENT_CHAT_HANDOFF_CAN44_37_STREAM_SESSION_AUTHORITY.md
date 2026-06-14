# CAN44.37 - Stream Session Authority

## Ziel

CAN44.37 macht `twitch_events` zur zentralen Stream-Session-Wahrheit fuer alle Module.

Nicht mehr der Kalendertag ist entscheidend, sondern eine stabile StreamSession:

- `streamState.live` = aktueller nutzbarer Live-Zustand
- `streamState.status` = offline / pending / pending_warning / live / degraded / ending / reconnect / closed / bandwidth_test
- `streamSession.streamSessionId` = technische Session-ID
- `streamSession.streamDayId` = Streamtag-ID fuer Module wie AutoShoutout
- `streamSession.calendarDay` = aktuelles Kalenderdatum
- `streamSession.streamDateLabel` = Datum des Streamstarts, bleibt ueber 00:00 stabil

## Geaenderte Dateien

- `backend/modules/twitch_events.js`
- `backend/modules/clip_shoutout.js`

## Versionen

- `twitch_events`: 0.1.8 -> 0.1.9
- `clip_shoutout`: 0.2.48 -> 0.2.49

## Logik

### OBS startet, Twitch bestaetigt noch nicht

- Status: `pending`
- Session wird vorbereitet
- `streamDayId` ist stabil vorbereitet
- kein `twitch.stream.online` fuer echte Live-Module
- kein AutoShoutout als echter Live-Stream

### Twitch bestaetigt live oder streamId ist vorhanden

- Status: `live`
- Session wird bestaetigt
- `twitch.stream.online` wird ueber den Communication Bus gesendet
- Payload enthaelt `streamSessionId`, `streamDayId`, `calendarDay`, `streamDateLabel`

### Twitch/API faellt weg, OBS streamt weiter

- Status: `degraded`
- Session bleibt aktiv
- kein neuer Streamtag
- Warnung: Twitch fehlt, OBS schuetzt die Session

### OBS/Twitch offline oder OBS-Verbindung weg

- Status: `ending` oder `reconnect`
- Session bleibt in Grace offen
- `twitch.stream.offline` kann gesendet werden, aber die Session wird nicht sofort geschlossen
- wenn innerhalb Grace wieder bestaetigt wird: gleiche Session wird fortgesetzt

### Grace laeuft ab

- Status: `closed`
- Grund: `obs_stream_stopped_grace_expired` oder `reconnect_timeout`

### Bandbreitentest

- Status: `bandwidth_test`
- kein echter Streamtag
- keine echte StreamSession
- kein `twitch.stream.online`
- Erkennung ueber bekannte Flags, falls OBS/Route diese liefert, sowie manuell per Override-Status testbar

## Neue/erweiterte Routen

- `GET /api/twitch/events/stream-state`
- `GET /api/twitch/events/stream-state?refresh=1`
- `GET /api/twitch/events/stream-session`
- `GET /api/twitch/events/stream-session?refresh=1`
- `POST /api/twitch/events/stream-state/override`
- `POST /api/twitch/events/stream-state/clear-override`

## Bus Events

Weiterhin:

- `twitch.stream.online`
- `twitch.stream.offline`

Neu fuer StreamSessions:

- `twitch.stream.session.started`
- `twitch.stream.session.pending`
- `twitch.stream.session.confirmed`
- `twitch.stream.session.warning`
- `twitch.stream.session.grace`
- `twitch.stream.session.reconnect`
- `twitch.stream.session.resumed`
- `twitch.stream.session.ended`

## AutoShoutout

AutoShoutout nutzt nun bevorzugt den von `twitch_events` per Bus gelieferten StreamState/StreamSession-State. Dadurch nutzt AutoShoutout die zentrale `streamDayId` statt selber aus Datum/Fallback zu raten.

Wenn der zentrale Stream-State offline/pending/reconnect/ending/closed/bandwidth_test sagt, erzeugt AutoShoutout keinen neuen Fallback-StreamDay.

## Installation

ZIP nach `D:\Git\stream-control-center` entpacken.

Dann:

```cmd
.\stepdone.cmd "CAN44.37 Stream Session Authority"
```

Danach Live-System aktualisieren/deployen.

## Tests

```powershell
node -c "D:\Streaming\stramAssets\backend\modules\twitch_events.js"
node -c "D:\Streaming\stramAssets\backend\modules\clip_shoutout.js"

$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$t.moduleVersion
$t.diagnostics.streamState.status
$t.diagnostics.streamState.streamSession | ConvertTo-Json -Depth 8

$ss = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-session?refresh=1"
$ss.streamSession | ConvertTo-Json -Depth 8
```

### Pending-Test: OBS startet, Twitch nicht bestaetigt

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:8080/api/twitch/events/stream-state/override" `
  -ContentType "application/json" `
  -Body '{"live":true,"reason":"manual_session_live_test","ttlMs":600000}' |
  ConvertTo-Json -Depth 8
```

### Offline/Reconnect-Test

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:8080/api/twitch/events/stream-state/override" `
  -ContentType "application/json" `
  -Body '{"live":false,"reason":"manual_session_offline_test","ttlMs":600000}' |
  ConvertTo-Json -Depth 8
```

### Bandbreitentest-Test

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:8080/api/twitch/events/stream-state/override" `
  -ContentType "application/json" `
  -Body '{"live":true,"status":"bandwidth_test","reason":"manual_bandwidth_test","ttlMs":600000}' |
  ConvertTo-Json -Depth 8
```

### Override loeschen

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:8080/api/twitch/events/stream-state/clear-override" `
  -ContentType "application/json" `
  -Body '{"reason":"manual_session_test_done"}' |
  ConvertTo-Json -Depth 8
```

## Hinweise

- OBS ist die staerkste Quelle fuer bewusstes Starten/Stoppen.
- Twitch streamId ist die staerkste Bestaetigung fuer einen echten Twitch-Livestream.
- Twitch offline alleine schliesst keine Session sofort.
- OBS/WebSocket-Verlust plus Twitch offline wird als Reconnect/Grace behandelt.
- Stream ueber 00:00 bleibt derselbe Streamtag.
