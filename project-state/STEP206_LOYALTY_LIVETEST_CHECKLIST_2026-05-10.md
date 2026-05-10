# STEP206 - Loyalty Livetest Checkliste

Stand: 2026-05-10
Projekt: stream-control-center
Bereich: Loyalty / Kekskrümel / Twitch EventSub / Watch Runner

## Ziel

Dieser STEP dokumentiert die konkrete Livetest-Checkliste fuer den naechsten echten Stream.
Es werden keine Code-Dateien geaendert.

Ziel des Livetests:

- Pruefen, ob der Loyalty AutoRunner durch Streamer.bot Streamstart automatisch startet.
- Pruefen, ob doppelte Twitch/EventSub Online-Signale den Streamer.bot-Start nicht ueberschreiben.
- Pruefen, ob Watch-Punkte nach dem eingestellten Intervall gebucht werden.
- Pruefen, ob Bot-/Systemuser ignoriert werden.
- Pruefen, ob Event-Boni fuer Follow/Sub/Resub/Bits/Raid/GiftSub weiterhin korrekt im Shadow Mode gebucht werden.
- Nach Streamende pruefen, ob Runner und Stream-State sauber offline sind.

## Aktueller technischer Stand

- Loyalty-Modul laeuft im Shadow Mode.
- Version nach STEP205: 0.1.9.
- StreamElements bleibt aktiv.
- Watch-Earning ist aktiv.
- Event-Boni sind aktiv.
- AutoRunner startet/stoppt seit STEP204 automatisch ueber Stream-State Start/Stop.
- Doppelte Start-Signale werden seit STEP205 als Signal geloggt und ueberschreiben den urspruenglichen Stream-State nicht mehr.

## Relevante Streamer.bot Calls

### Stream Start

```text
http://127.0.0.1:8080/api/loyalty/stream-state/start?source=streamerbot
```

Erwartung:

- `effective.live = true`
- `autoRunner.timerActive = true`
- `autoRunner.trigger = stream_state_start:streamerbot`

### Stream Stop

```text
http://127.0.0.1:8080/api/loyalty/stream-state/stop?source=streamerbot
```

Erwartung:

- `effective.live = false`
- `autoRunner.timerActive = false`
- `autoRunner.trigger = stream_state_stop:streamerbot`

## Vor dem Stream pruefen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 60
```

Erwartung:

```text
ok = true
version = 0.1.9
mode = shadow
features.watchEarningEnabled = true
features.eventBonusesEnabled = true
autoRunner.enabled = false
autoRunner.timerActive = false
autoRunner.streamState.effective.live = false
```

Ignore-Liste pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/ignored-users" | ConvertTo-Json -Depth 40
```

Mindestens erwartet:

```text
forrestcgn
streamelements
streamstickers
kofistreambot
presenceviewer
```

## Direkt nach Streamstart pruefen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
```

Erwartung:

```text
enabled = true
timerActive = true
streamState.effective.live = true
trigger = stream_state_start:streamerbot
```

Runner-Events pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 100
```

Erwartete Eventtypen:

```text
runner_started
runner_auto_started_by_stream_state
stream_state_started
```

Wenn Twitch/EventSub ebenfalls online meldet, zusaetzlich erwartet:

```text
runner_start_already_running
stream_state_start_signal
```

Wichtig:

```text
manual.source soll streamerbot bleiben.
```

## Nach 10 bis 12 Minuten Streamlauf pruefen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 100
```

Oder:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=10" | ConvertTo-Json -Depth 120
```

Erwartung:

```text
eventType = run_ok
awarded > 0
processedCount > 0
```

Bei ignorierten Usern erwartet:

```text
reason = ignored_user
```

Bei normalen Usern nach erstem faelligen Intervall erwartet:

```text
reason = watch_interval_awarded
amount = 2
```

Bei Subscriber nach faelligem Intervall erwartet:

```text
amount = watch.amount * watch.subscriberMultiplier
```

Aktuell laut Config:

```text
watch.amount = 2
watch.intervalMinutes = 10
watch.subscriberMultiplier = 3
Subscriber = 6 Punkte pro Intervall
```

## Event-Boni waehrend Stream beobachten

Status Twitch Alert Bridge:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 60
```

Loyalty Events:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events" | ConvertTo-Json -Depth 100
```

Event-Bonus-Transaktionen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions?type=event_bonus" | ConvertTo-Json -Depth 100
```

Erwartete Punkte:

```text
Follow = 10
Sub Tier 1000 = 50
Sub Tier 2000 = 100
Sub Tier 3000 = 150
Bits 500 = 50
Raid = 50
GiftSub Gifter Tier 1000 = 50 pro Sub
GiftSub Receiver Tier 1000 = 25
GiftBomb 5er Tier 1000 = Gifter 250 + Receiver separat je 25, falls Receiver-Events ankommen
```

## Nach Streamende pruefen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 80
```

Erwartung:

```text
enabled = false
timerActive = false
streamState.effective.live = false
trigger = stream_state_stop:streamerbot
```

Runner-Events:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 100
```

Erwartete Eventtypen:

```text
runner_stopped
runner_auto_stopped_by_stream_state
stream_state_stopped
```

## Auswertungsdateien nach dem Stream erzeugen

```powershell
cd D:\Git\stream-control-center

$Stamp = Get-Date -Format "yyyy-MM-dd_HHmmss"
$OutDir = ".\streamauswertung_loyalty_$Stamp"
New-Item -ItemType Directory -Force -Path $OutDir | Out-Null

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" |
  ConvertTo-Json -Depth 100 |
  Out-File "$OutDir\01_loyalty_status.json" -Encoding UTF8

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=200" |
  ConvertTo-Json -Depth 120 |
  Out-File "$OutDir\02_loyalty_runner_events.json" -Encoding UTF8

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/events" |
  ConvertTo-Json -Depth 120 |
  Out-File "$OutDir\03_loyalty_events.json" -Encoding UTF8

Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/transactions" |
  ConvertTo-Json -Depth 120 |
  Out-File "$OutDir\04_loyalty_transactions_all.json" -Encoding UTF8

Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" |
  ConvertTo-Json -Depth 80 |
  Out-File "$OutDir\05_twitch_alert_bridge_status.json" -Encoding UTF8

Compress-Archive -Path "$OutDir\*" -DestinationPath ".\streamauswertung_loyalty_$Stamp.zip" -Force

Write-Host "Fertig: $OutDir"
Write-Host "ZIP: .\streamauswertung_loyalty_$Stamp.zip"
```

## Bewertungskriterien nach Livetest

Der Livetest gilt als erfolgreich, wenn:

- Streamer.bot Start den Runner automatisch aktiviert.
- Twitch/EventSub Online-Signale nur als Signal geloggt werden und den Streamer.bot-State nicht ueberschreiben.
- Nach 10 bis 12 Minuten mindestens ein Runner-Lauf stattfindet.
- Presence-User verarbeitet werden.
- Bots/Systemuser ignoriert werden.
- Normale User nach faelligem Intervall Watch-Punkte erhalten.
- Event-Boni weiterhin korrekt gebucht werden.
- Stream Stop den Runner automatisch deaktiviert.

## Offen nach Livetest

- Echte Streamdaten auswerten.
- Balance-Regeln pruefen.
- Dashboard-Ansicht fuer Runner/Events/Transactions planen.
- Spaeter StreamElements-Import vorbereiten.
- Shadow-vs-Live-Umschaltung erst nach mehreren erfolgreichen Livetests entscheiden.
