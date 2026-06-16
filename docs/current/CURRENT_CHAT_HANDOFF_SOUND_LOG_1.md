# SOUND-LOG-1 – Recent Playback Log im Sound-System

## Stand

- Modul: `sound_system`
- Version: `0.1.28`
- Build: `STEP_SOUND_LOG_1_RECENT_PLAYBACK_LOG`

## Ziel

Ein eigener, sauber lesbarer Verlauf für zuletzt gespielte Sounds wurde im Sound-System ergänzt. Der Verlauf ist nicht mehr nur aus dem allgemeinen EventBus ableitbar, sondern über eine eigene API abrufbar.

## Neue Route

```text
GET /api/sound/recent-playback
```

Optionale Query:

```text
?limit=50
?status=started|finished|error|skipped|stopped
?source=stream_events
```

## Erfasste Felder

- `requestId`
- `correlationId`
- `soundId`
- `label`
- `file`
- `audioUrl`
- `mediaType`
- `source` / `sourceModule`
- `category`
- `target` / `outputTarget`
- `requestedBy`
- `configuredDurationMs`
- `startedAt`
- `finishedAt`
- `playbackMs`
- `gapMs`
- `status`
- `reason`
- `error`
- Bundle-/EventSound-Meta soweit vorhanden

## Wichtig

- Keine Änderung am Sound-Playback.
- Keine Änderung an Overlays.
- Keine Änderung an Dashboard/DB.
- SOUND-GAP-1 bleibt aktiv.
- Das Dashboard-Thema ist als TODO vermerkt.

## Test

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild
$s.playbackLog
```

Erwartung:

```text
sound_system 0.1.28
STEP_SOUND_LOG_1_RECENT_PLAYBACK_LOG
playbackLog.prepared: True
```

Nach ein paar Sounds:

```powershell
$log = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=20"
$log.items | Format-Table startedAt,finishedAt,status,soundId,label,source,category,playbackMs,gapMs -AutoSize
```
