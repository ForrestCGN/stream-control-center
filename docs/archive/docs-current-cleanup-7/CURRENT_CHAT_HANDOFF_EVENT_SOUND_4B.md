# CURRENT CHAT HANDOFF – EVENT-SOUND-4B

Stand: 2026-06-16

## Step

EVENT-SOUND-4B – EventSound-Item setzt required eventPreRoll-Flag

## Problem

`POST /api/stream-events/sound-runtime/next-round?play=1&confirm=1` forderte Playback an, aber das an `sound_system.playStreamEventPreRollItem(...)` uebergebene Item wurde nicht sicher mit `meta.eventPreRoll.enabled=true` markiert.

Das Sound-System blockte korrekt mit:

```text
event_preroll_flag_required
```

## Aenderung

`backend/modules/stream_events.js`:

- Version auf `0.5.32` erhoeht
- Build auf `STEP_EVENT_SOUND_4B_PREROLL_FLAG_FIX` gesetzt
- `requestSoundSystemPlaybackForSoundRound(...)` markiert das kontrollierte Playback-Item jetzt explizit mit:
  - `meta.eventPreRoll.enabled = true`
  - `meta.eventPreRoll.countdownEnabled = true`
  - `meta.eventPreRoll.preRollEnabled = true`
  - `meta.eventPreRoll.owner = stream_events`
  - `meta.eventPreRoll.eventUid`
  - `meta.eventPreRoll.roundUid`
  - `meta.eventPreRoll.seconds`
  - `meta.eventPreRoll.finalLabel`
  - `meta.eventPreRoll.caption`
  - `meta.eventPreRoll.guessingLabel`

## Nicht geaendert

- `backend/modules/sound_system.js`
- `htdocs/overlays/sound_system_overlay.html`
- `htdocs/overlays/stream_events/event_runtime_overlay.html`
- normale Sound-Queue
- normale Soundalerts
- Dashboard
- DB-Schema
- Media-System
- Antwort-/Punkte-Logik

## Tests nach Einspielen + StepDone

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild

$e = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$e | Select-Object ok,module,moduleVersion,moduleBuild
```

Erwartung:

```text
sound_system 0.1.26 / STEP_EVENT_SOUND_4_STREAM_EVENTS_ROUND_PLAYBACK_BINDING
stream_events 0.5.32 / STEP_EVENT_SOUND_4B_PREROLL_FLAG_FIX
```

Testevent anlegen:

```powershell
Remove-Variable r,ev -ErrorAction SilentlyContinue
$ev = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/create-test-event?confirm=1"
$ev | Select-Object ok,eventUid
```

Playback-Test:

```powershell
$r = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round?play=1&confirm=1"
$r | Select-Object ok,eventUid,soundSystemPlaybackRequested
$r.playbackResult
```

Erwartung:

```text
soundSystemPlaybackRequested = True
playbackResult.ok = True
kein event_preroll_flag_required
Countdown sichtbar
Sound startet danach ueber Sound-System
```
