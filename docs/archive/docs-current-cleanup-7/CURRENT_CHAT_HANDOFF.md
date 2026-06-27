# CURRENT CHAT HANDOFF – CAN44.42 Shoutout / AutoSO / Live stabiler Stand

Stand: 2026-06-14
Projekt: `ForrestCGN/stream-control-center`
Branch: `dev`
Live-Ziel: `D:\Streaming\stramAssets`

## Startanweisung für neuen Chat

```text
Wir machen nach CAN44.42 weiter. Bitte lies docs/current/CURRENT_CHAT_HANDOFF_CAN44_42_SHOUTOUT_AUTOSO_LIVE.md und halte dich an den Master-Prompt. Aktueller Stand: SO / AutoSO / Twitch-Events / Live-Status sind intern stabil. Nächster echter Test ist ein realer OBS/Twitch-Streamstart. Keine Annahmen, echte Dateien/GitHub-dev als Source of Truth.
```

## Arbeitsregeln

```text
Deutsch, ruhig, direkt, Schritt für Schritt.
Keine Funktionalität entfernen.
Echte Dateien/GitHub-dev als Single Source of Truth.
Produktive SQLite-DB nicht ersetzen/neu bauen.
Keine Patch-/Regex-/Apply-Scripte.
Bei Codeänderung vollständige Ersatzdatei-ZIP mit echten Zielpfaden.
Nach ZIP StepDone ausführen.
```

## Aktueller stabiler Stand

```text
CAN44.42 – Dashboard Effective Stream State Display
```

### Bestätigt

```text
Manual Override confirmed online:
status = live
live = True
provider = manual_override
source = manual_override
lastEventKey = twitch.stream.online
streamSession.status = live
streamSession.twitchConfirmed = true
streamDayId vorhanden

Dashboard:
Effektiver Stream-State zeigt ONLINE (Override)
Echte Quellen zeigen weiterhin reale Quellen getrennt
```

## Wichtige Architektur

```text
twitch_events
  → zentrale Twitch-Event-Schicht
  → Chat-Events über Bus
  → Stream-State / StreamSession
  → Online/Offline über Bus

stream_status
  → source-only Statusquelle
  → nicht Owner der twitch.stream.* Events

clip_shoutout
  → Shoutout / AutoShoutout
  → Consumer von twitch.chat/message
  → Consumer von twitch.stream online/offline
  → nutzt zentrale streamDayId/streamSessionId
```

## StreamDay / StreamSession Regeln

```text
Kalendertag != Streamtag

Stream startet 22:00 und endet 02:00:
calendarDay wechselt um 00:00
streamDateLabel bleibt Startdatum
streamDayId bleibt identisch
```

Statuslogik:

```text
offline
pending
live
ending
reconnect
bandwidth_test
closed
```

Wichtige Regeln:

```text
Pending erzeugt kein online/offline.
Bandbreitentest erzeugt kein online/offline und keinen echten Streamtag.
Offline wird nur emitted, wenn vorher online emitted wurde.
Manual Override active=true ist harte Wahrheit.
```

## Nächster echter Test

Beim nächsten Streamstart:

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
OBS startet → pending
Twitch bestätigt → live
streamDayId bleibt stabil
twitch.stream.online genau einmal
AutoShoutout empfängt online
```

Beim Streamende:

```text
OBS StreamStopped → ending/grace
danach offline
twitch.stream.offline genau einmal
```

## Wichtige Tests ohne echten Stream

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

## Relevante Dateien

```text
backend/modules/twitch_events.js
backend/modules/clip_shoutout.js
backend/modules/stream_status.js
backend/modules/live_status_monitor.js
htdocs/dashboard/modules/live_status_monitor.js
htdocs/dashboard/modules/live_status_monitor.css
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
```

## Offene Punkte

```text
- Echter OBS/Twitch-Start noch nicht live-real bestätigt.
- Optional: manualOverride.status/forceConfirmed/streamId beim Clear vollständig leeren.
- Weitere Module später an zentralen StreamState anbinden.
```
