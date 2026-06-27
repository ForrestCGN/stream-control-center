# CURRENT CHAT HANDOFF – CAN44.42 Shoutout / AutoSO / Live stabiler Stand

Stand: 2026-06-14
Projekt: `ForrestCGN/stream-control-center`
Branch: `dev`
Live-Ziel: `D:\Streaming\stramAssets`

## Startanweisung für neuen Chat

```text
Wir machen nach CAN44.42 weiter. Bitte lies docs/current/CURRENT_CHAT_HANDOFF_CAN44_42_SHOUTOUT_AUTOSO_LIVE.md und halte dich an den Master-Prompt. Aktueller Stand: SO / AutoSO / Twitch-Events / Live-Status sind intern stabil und seit 2026-06-14 live-real mit echtem OBS/Twitch-Streamstart und Streamende bestätigt. Keine Annahmen, echte Dateien/GitHub-dev als Source of Truth.
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
CAN44.42 – Shoutout / AutoShoutout / Twitch-Events / Live-Status live-real bestätigt
```

### Bestätigt intern

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

### Bestätigt live-real am 2026-06-14

Streamstart:

```text
status = live
live = True
source = twitch_confirmed
confidence = high
streamId = 317679322342
twitchConfirmed = true
obsStarted = true
bandwidthTest = false
lastEventKey = twitch.stream.online
onlineEmitted = 1
offlineEmitted = 0
errors = 0
sessionStarted = 1
sessionConfirmed = 1
```

Stabile Stream-Zuordnung:

```text
streamSessionId = forrestcgn_20260614t140137581z_pending
streamDayId     = stream_forrestcgn_20260614t140137581z_pending
streamDateLabel = 2026-06-14
```

AutoShoutout Online:

```text
moduleVersion = 0.2.49
streamBusSubscriber.installed = True
onlineReceived = 1
lastEventKey = twitch.stream.online
lastResultReason = accepted
```

Streamende:

```text
status = offline
live = False
lastEventKey = twitch.stream.offline
onlineEmitted = 1
offlineEmitted = 1
errors = 0
sessionGrace = 1
sessionEnded = 1
bandwidthTestDetected = 0
```

AutoShoutout Offline:

```text
delivered = 2
onlineReceived = 1
offlineReceived = 1
lastEventKey = twitch.stream.offline
lastResultReason = accepted
errors = 0
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
- Optional: manualOverride.status/forceConfirmed/streamId beim Clear vollständig leeren.
- Weitere Module an zentralen StreamState anbinden.
- Nächster empfohlener Arbeitsblock: Tagebuch an zentralen StreamState anbinden.
```

## Nächster Schritt

```text
Vor Umsetzung Tagebuch-Dateien und bestehende Helper/Routen/DB-Strukturen prüfen.
Dann Ziel/Dateien/Änderungen/Nichtänderungen/Tests nennen.
Auf Forrests go warten.
```
