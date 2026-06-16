# CURRENT CHAT HANDOFF – EVENT-SOUND-4

Stand: 2026-06-16

## Step

EVENT-SOUND-4 – Eventsystem-Soundrunde an Sound-System-PreRoll-Flow anbinden

## Ziel

Echte Sound-Schnipsel-Runden koennen jetzt kontrolliert ueber das bestehende Sound-System gestartet werden.

Der normale `next-round` Flow bleibt vorbereitet-only, solange kein explizites `play=1&confirm=1` gesetzt ist.

## Betroffene Dateien

- `backend/modules/sound_system.js`
- `backend/modules/stream_events.js`

## Versionen

- `sound_system.js`: `0.1.26` / `STEP_EVENT_SOUND_4_STREAM_EVENTS_ROUND_PLAYBACK_BINDING`
- `stream_events.js`: `0.5.31` / `STEP_EVENT_SOUND_4_ROUND_PLAYBACK_BINDING`

## Neue/erweiterte Logik

### Sound-System

- neue interne Funktion `playStreamEventPreRollItem(input)`
- akzeptiert nur Items aus `stream_events`
- verlangt explizites `meta.eventPreRoll.enabled === true`
- nutzt weiterhin die bestehende `normalizePlayRequest()` + `enqueueOrStart()` Logik
- Sound-System bleibt Playback-/Queue-Owner

### Stream-Events

- `createSoundRound()` kann optional echtes Playback ausloesen
- nur bei explizitem Flag:
  - `play=1`
  - `confirm=1`
- ohne diese Flags bleibt der Flow vorbereitet-only

Kontrollierter Test/Start:

```text
POST /api/stream-events/sound-runtime/next-round?play=1&confirm=1
```

Nur vorbereiten, ohne Playback:

```text
POST /api/stream-events/sound-runtime/next-round
```

## Sicherheitsregeln

- Overlay startet keinen Sound
- Eventsystem startet nicht am Sound-System vorbei
- Sound-System bleibt Gatekeeper
- normale Sounds/Soundalerts bleiben unveraendert
- Playback nur fuer explizit markierte `stream_events` Items
- kein DB-Schema geaendert

## Tests nach StepDone

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild

$e = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$e | Select-Object ok,module,moduleVersion,moduleBuild
$e.eventSoundBusIntegration
```

Prepared-only Test:

```powershell
$r = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round"
$r | Select-Object ok,eventUid,soundSystemPlaybackRequested
$r.playbackResult
```

Playback-Test:

```powershell
$r = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round?play=1&confirm=1"
$r | Select-Object ok,eventUid,soundSystemPlaybackRequested
$r.playbackResult
```

Erwartung:

- Prepared-only: kein Soundstart
- Playback-Test: Runtime-Overlay Countdown, danach Sound-System-Playback
- Sound-System Status zeigt EventPreRoll aktiv/letzte Aktion

## Naechster sinnvoller Step

EVENT-SOUND-5 – echten EventSound-Flow testen, Fehlerbilder pruefen und danach Dashboard-/Config-Anbindung planen.
