# Modul-Doku – Sound-System

Datei: `backend/modules/sound_system.js`  
Stand: `0.1.30` / `STEP_SOUND_GAP_2_PLAYBACK_LOG_AUDIO_END_AND_GAP_END`  
Zuletzt aktualisiert: 2026-06-17

## Aufgabe

Das Sound-System ist der zentrale Owner für Sound-Playback, Queue, Ausgabeziel, SoundBus-Events und Pausen zwischen Sounds. Andere Module sollen Sounds nicht direkt abspielen, sondern kontrolliert über das Sound-System gehen.

## Aktuelle bestätigte Funktionen

### EventSound PreRoll-Gate

Für EventSound kann vor dem eigentlichen Playback ein Countdown/PreRoll laufen. Das Runtime-Overlay zeigt Countdown/Guessing, startet aber kein Audio.

Status:

```text
GET /api/sound/event-preroll/status
```

### Globale Pause zwischen Sounds

Aktueller interner Standard:

```text
postPlaybackGap.durationMs = 2000
postPlaybackGap.enabled = true
postPlaybackGap.blockQueueStart = true
postPlaybackGap.holdEventRuntimeOverlay = true
```

Bestätigt: Die Queue startet erst nach `gapEndedAt` weiter.

Dashboard:

```text
System -> Sound-System -> Globale Sound-Pause
```

### Recent Playback Log

Route:

```text
GET /api/sound/recent-playback?limit=20
```

Erfasst aktuell u. a.:

- `soundId`
- `label`
- `file`
- `audioUrl`
- `source`
- `category`
- `target`
- `outputTarget`
- `startedAt`
- `audioEndedAt`
- `gapStartedAt`
- `gapEndedAt`
- `finishedAt`
- `playbackMs`
- `gapMs`
- `status`
- `requestId`
- `correlationId`

Wichtig:

```text
finishedAt = Abschluss nach Gap
audioEndedAt = echtes Audio-Ende
gapEndedAt = Ende der Sound-Pause
```

Dashboard:

```text
System -> Sound-System -> Zuletzt gespielt
```

## Diagnose-Befehle

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild
$s.postPlaybackGap
$s.playbackLog

$log = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=20"
$log.items | Select-Object startedAt,audioEndedAt,gapStartedAt,gapEndedAt,finishedAt,status,soundId,label,source,category,playbackMs,gapMs | Format-Table -AutoSize
```

## Bestätigter Mischtest

Gemischter Test mit Alerts, Channelpoints/UserSounds und EventSound bestätigte:

```text
Audio-Ende -> ca. 2 Sekunden Gap -> nächster Queue-Start
```

## Offene Punkte

- Pause zwischen Sounds später im Dashboard editierbar machen.
- Recent Playback um Filter/Details erweitern.
- Fehler/failed Playback im Dashboard deutlicher anzeigen.
- EventSound-Konfiguration später über Stream-Events-Dashboard, Media-System und Sound-System-Config verbinden.
