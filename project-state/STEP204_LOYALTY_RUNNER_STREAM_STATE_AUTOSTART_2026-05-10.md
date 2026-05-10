# STEP204 – Loyalty AutoRunner an Stream-State koppeln

Stand: 2026-05-10
Projekt: stream-control-center
Branch: dev
Betroffene Datei: `backend/modules/loyalty.js`

## Ziel

Der Loyalty AutoRunner soll automatisch starten, wenn der Stream-State auf live gesetzt wird, und automatisch stoppen, wenn der Stream-State auf offline gesetzt wird.

Dadurch reicht weiterhin der bekannte Streamer.bot-Aufruf:

```text
/api/loyalty/stream-state/start?source=streamerbot
```

und der Runner wird im selben Ablauf idempotent gestartet.

## Änderungen

### backend/modules/loyalty.js

- Version von `0.1.7` auf `0.1.8` erhöht.
- Neue AutoRunner-Settings ergänzt:
  - `autoRunner.startOnStreamStateStart` default `true`
  - `autoRunner.stopOnStreamStateStop` default `true`
  - `autoRunner.startOnAutoLive` default `true`
  - `autoRunner.stopOnAutoOffline` default `false`
- `GET/POST /api/loyalty/stream-state/start` setzt weiterhin den Stream-State auf live und startet zusätzlich den AutoRunner, falls das Setting aktiv ist.
- `GET/POST /api/loyalty/stream-state/stop` setzt weiterhin den Stream-State auf offline und stoppt zusätzlich den AutoRunner, falls das Setting aktiv ist.
- Runner-Start bleibt idempotent:
  - Wenn der Runner bereits läuft, wird kein zweiter Timer gestartet.
  - Der Fall wird als `runner_start_already_running` geloggt.
- Runner-Stop ist ebenfalls nachvollziehbar:
  - Wenn der Runner bereits gestoppt ist, wird `runner_stop_already_stopped` geloggt.
- Stream-State-Automation wird in `loyalty_runner_events` protokolliert:
  - `stream_state_started`
  - `stream_state_stopped`
  - `runner_auto_started_by_stream_state`
  - `runner_auto_stopped_by_stream_state`
  - `runner_auto_start_skipped_by_setting`
  - `runner_auto_stop_skipped_by_setting`
- `GET/POST /api/loyalty/stream-state/refresh-auto` kann bei Twitch-Live-Erkennung den Runner ebenfalls starten.
  - `startOnAutoLive=true` startet bei Twitch online.
  - `stopOnAutoOffline=false` verhindert standardmäßig, dass ein Twitch-Offline-Check einen durch Streamer.bot gesetzten Stream unbeabsichtigt stoppt.

## Bewusst nicht geändert

- Keine Änderung an Punkteberechnung.
- Keine Änderung an Event-Bonus-Logik.
- Keine Änderung an Alert-System.
- Keine Änderung an Datenbankdateien.
- Keine neue Parallelstruktur für Logs; genutzt wird die vorhandene Tabelle `loyalty_runner_events`.
- Keine Secrets, Tokens, SQLite-Dateien oder Backups enthalten.

## Tests nach Entpacken

```powershell
cd D:\Git\stream-control-center
node --check .\backend\modules\loyalty.js
```

Backend neu starten oder per stepdone/deploy ausrollen.

### Live-Test Streamer.bot Start

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=streamerbot&reason=test_start" | ConvertTo-Json -Depth 50
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 50
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 80
```

Erwartung:

- Stream-State ist live.
- Runner ist enabled/timerActive.
- Runner-Events zeigen Quelle `streamerbot`.

### Doppelstart-Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/start?source=twitch_eventsub&reason=test_duplicate_start" | ConvertTo-Json -Depth 50
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 80
```

Erwartung:

- Kein zweiter Runner-Timer.
- Event `runner_start_already_running` ist sichtbar.

### Stop-Test

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/stream-state/stop?source=streamerbot&reason=test_stop" | ConvertTo-Json -Depth 50
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/status" | ConvertTo-Json -Depth 50
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/runner/events?limit=20" | ConvertTo-Json -Depth 80
```

Erwartung:

- Stream-State ist offline.
- Runner ist disabled/timerActive=false.
- Stop-Quelle ist sichtbar.

## Commit-Befehl nach manuellem Entpacken

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "feat: auto start loyalty runner from stream state"
```
