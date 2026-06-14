# NEXT_STEPS – stream-control-center

Stand: 2026-06-14

## Aktueller Stand nach CAN44.42

```text
SO / AutoSO / Live-Status sind intern durchgetestet.
CAN44.42 ist der aktuelle stabile Arbeitsstand.
```

## Direkt beim nächsten echten Streamstart testen

### 1. Vor Streamstart

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/status"
$t.diagnostics.streamState.status
$t.diagnostics.streamState.live
$t.diagnostics.streamState.streamSession | ConvertTo-Json -Depth 10
$t.diagnostics.streamState.counters
```

Erwartung:

```text
status = offline
live = False
streamSession.active = false
streamDayId = ""
```

### 2. OBS Stream starten

Nach 5–10 Sekunden:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state?refresh=1"
$t.streamState.status
$t.streamState.live
$t.streamState.sources
$t.streamState.streamSession | ConvertTo-Json -Depth 10
$t.streamState.counters
```

Erlaubte gute Zustände:

```text
pending
→ OBS sendet, Twitch hat noch nicht bestätigt

live
→ Twitch hat bestätigt
```

### 3. Twitch-Bestätigung prüfen

Nach 30–60 Sekunden:

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state?refresh=1"
$t.streamState.status
$t.streamState.live
$t.streamState.streamId
$t.streamState.streamDayId
$t.streamState.streamSession | ConvertTo-Json -Depth 10
$t.streamState.lastEventKey
$t.streamState.counters
```

Erwartung bei echtem Live:

```text
status = live
live = True
streamSession.twitchConfirmed = true
streamDayId vorhanden und stabil
lastEventKey = twitch.stream.online
onlineEmitted = 1
```

### 4. AutoShoutout Consumer prüfen

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s.moduleVersion
$s.autoShoutout.state.streamState
$s.autoShoutout.state.streamBusSubscriber
```

Erwartung:

```text
clip_shoutout = 0.2.49
streamBusSubscriber.installed = True
streamState.eventKey = twitch.stream.online
streamState.streamDayId vorhanden
```

## Beim echten Streamende prüfen

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/events/stream-state?refresh=1"
$t.streamState.status
$t.streamState.live
$t.streamState.streamSession | ConvertTo-Json -Depth 10
$t.streamState.lastEventKey
$t.streamState.counters
```

Erwartung:

```text
OBS bewusst gestoppt
→ status ending/grace
→ danach closed
→ twitch.stream.offline genau einmal
```

## Dashboard-Test

```text
Dashboard → Live-Status Monitor
```

Prüfen:

```text
- Stream-State Override Bereich sichtbar.
- Online bestätigt simulieren zeigt oben Override live.
- Effektiver Stream-State zeigt ONLINE (Override).
- Echte Quellen bleiben getrennt sichtbar.
- Override löschen geht zurück zu echten Quellen.
```

## Optionaler interner Test ohne echten Stream

Confirmed Online:

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:8080/api/twitch/events/stream-state/override" `
  -ContentType "application/json" `
  -Body '{"live":true,"status":"live","confirmed":true,"forceConfirmed":true,"streamId":"manual_dashboard_test","reason":"manual_confirmed_test","ttlMs":600000}' |
  ConvertTo-Json -Depth 10
```

Clear:

```powershell
Invoke-RestMethod `
  -Method POST `
  -Uri "http://127.0.0.1:8080/api/twitch/events/stream-state/clear-override" `
  -ContentType "application/json" `
  -Body '{"reason":"manual_override_test_done"}' |
  ConvertTo-Json -Depth 10
```

## Danach sinnvoll

```text
1. Nach echtem Streamstart/Ende Ergebnisse dokumentieren.
2. Falls stabil: CAN44.42 als finalen stabilen Shoutout/AutoSO/Live-Stand markieren.
3. Nächstes Modul an StreamState anbinden, z. B. Tagebuch oder Alerts.
```

## Nicht jetzt nötig

```text
Großer Refactor
Neue DB-Migrationen
Umbau Communication Bus
Entfernen bestehender Fallbacks
Umbau ShoutoutV2
```
