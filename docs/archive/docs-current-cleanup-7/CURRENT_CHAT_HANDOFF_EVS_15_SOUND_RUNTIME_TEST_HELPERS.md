# CURRENT CHAT HANDOFF – EVS-15 Sound Runtime Test Helpers

Stand: 2026-06-13
Projekt: stream-control-center / stream_events
Step: EVS-15 – Sound Runtime Test Helpers

## Ziel

EVS-15 ergänzt sichere Testhelfer für die in EVS-14 vorbereitete Sound-Runtime. Damit kann ein Sound-Testevent angelegt, gestartet und mit vorbereiteten Sound-Runden getestet werden, ohne dass das Sound-System produktiv abgespielt oder die Sound-Queue berührt wird.

## Geänderte Dateien

- `backend/modules/stream_events.js`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS_15_SOUND_RUNTIME_TEST_HELPERS.md`
- `docs/modules/stream_events.md`
- `project-state/CHANGELOG.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `project-state/TODO.md`

## Version

- `MODULE_VERSION = 0.5.1`
- `MODULE_BUILD = STEP_EVS_15_SOUND_RUNTIME_TEST_HELPERS`

## Neue Route

```text
POST /api/stream-events/sound-runtime/create-test-event?confirm=1
```

Optionaler Body:

```json
{
  "start": true
}
```

## Verhalten

Der Helper erstellt ein Event mit:

- `soundEnabled = true`
- `textEnabled = false`
- drei Test-Snippets
- akzeptierten Antwortvarianten
- Punkten pro Snippet
- `directPlaybackEnabled = false`
- `outputPreparedOnly = true`

Der Helper gibt außerdem Testflow-Hinweise zurück:

1. `POST /api/stream-events/sound-runtime/next-round`
2. `POST /api/stream-events/sound-runtime/resolve`
3. `GET /api/stream-events/sound-runtime/report`

## Sicherheitsregeln

- Es wird nichts direkt abgespielt.
- Die Sound-System-Queue wird nicht berührt.
- Es gibt keine direkte Twitch-Chat-Ausgabe.
- Der Helper benötigt ausdrücklich `confirm=1`.
- Wenn ein anderes Event aktiv ist, schlägt der Start wie bisher mit `another_event_active` fehl; das aktive Event wird nicht automatisch beendet.

## Testbefehle

```powershell
node -c .\backend\modules\stream_events.js
.\stepdone.cmd "EVS-15 Sound Runtime Test Helpers"
```

Testablauf:

```powershell
Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"start":true}' http://127.0.0.1:8080/api/stream-events/sound-runtime/create-test-event?confirm=1

Invoke-RestMethod -Method Post http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round

Invoke-RestMethod -Method Post -ContentType "application/json" -Body '{"user":"soundtester","answer":"heimleitung"}' http://127.0.0.1:8080/api/stream-events/sound-runtime/resolve

Invoke-RestMethod http://127.0.0.1:8080/api/stream-events/sound-runtime/report
```

## Nicht enthalten

- kein echtes Audio-Playback
- kein Zugriff auf Sound-System-Queue
- keine automatische Sound-Antwortauswertung aus Twitch-Chat
- kein Timer/Timeout
- kein Overlay
