# CURRENT STATUS - stream-control-center

Stand: 2026-05-10

## Loyalty

Aktueller Stand:

- Loyalty laeuft im Shadow Mode.
- StreamElements bleibt aktiv.
- Watch/Lurk Shadow-Punkte funktionieren grundsaetzlich ueber Twitch Presence + Auto Runner.
- Event-Boni im Shadow Mode funktionieren.
- Follow/Sub/Cheer/Raid/Resub funktionieren.
- GiftSub-Gifter funktioniert.
- GiftSub-Receiver wird zusaetzlich gebucht, wenn ein `recipientLogin` vorhanden und der Receiver-Bonus aktiviert ist.
- Duplicate-Schutz bleibt eventbasiert.

## STEP204 - AutoRunner Stream-State Autostart

- `backend/modules/loyalty.js` wurde auf Version 0.1.8 angehoben.
- `/api/loyalty/stream-state/start` startet den AutoRunner automatisch, wenn `autoRunner.startOnStreamStateStart = true` ist.
- `/api/loyalty/stream-state/stop` stoppt den AutoRunner automatisch, wenn `autoRunner.stopOnStreamStateStop = true` ist.
- Runner-Start ist idempotent: doppelte Starts erzeugen keinen zweiten Timer.
- Runner-Start/-Stop-Quellen werden in `loyalty_runner_events` geloggt.

## STEP205 - Stream-State Signal Logging

- `backend/modules/loyalty.js` wurde auf Version 0.1.9 angehoben.
- Doppelte Online-Signale ueberschreiben den bestehenden Stream-State nicht mehr.
- Wenn Streamer.bot zuerst live setzt und Twitch/EventSub danach ebenfalls online meldet, bleibt `manual.source = streamerbot` erhalten.
- Zusaetzliche Signale werden als `stream_state_start_signal` bzw. `stream_state_stop_signal` geloggt.

## STEP206 - Livetest Checkliste

- Eine konkrete Livetest-Checkliste fuer den naechsten Stream wurde dokumentiert.
- Ziel ist die Pruefung von AutoRunner, Watch-Punkten, Bot-Ignore-Liste, Twitch/EventSub-Signalen und Event-Boni im echten Stream.

## STEP207 - DB-Portabilitaetsanalyse und MySQL/MariaDB-Zielarchitektur

- DB-Portabilitaetsanalyse auf Basis eines lokalen Repo-Scans dokumentiert.
- Aktive Produktiv-DB bleibt `D:\Streaming\stramAssets\data\sqlite\app.sqlite`.
- `backend/core/database.js` bleibt die zentrale Zielschicht fuer neue DB-Zugriffe.
- MySQL und MariaDB sollen spaeter beide unterstuetzt werden.
- Technisch wird ein gemeinsamer MySQL-Family-Adapter geplant, statt zwei getrennte Codewelten zu bauen.
- Direkte `sqlite_core`-Kopplungen wurden als Migrationskandidaten dokumentiert.
- Kein Code, keine DB, kein Treiber und kein Live-System wurden geaendert.
