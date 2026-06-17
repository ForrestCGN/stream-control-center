# Testflow – EventSound Runtime und Sound-System

Stand: 2026-06-17

## 1. Versionen prüfen

```powershell
$e = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$e | Select-Object ok,module,moduleVersion,moduleBuild

$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild
$s.postPlaybackGap
$s.playbackLog
```

Erwartung:

```text
stream_events 0.5.36 / STEP_EVENT_SOUND_5B_OUTPUT_TARGET_CONFIG
sound_system 0.1.30 / STEP_SOUND_GAP_2_PLAYBACK_LOG_AUDIO_END_AND_GAP_END
postPlaybackGap.durationMs = 2000
playbackLog.prepared = true
```

## 2. Test-State aufräumen

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/reset-test-state?confirm=1"
```

## 3. Testevent mit echten Medien anlegen

```powershell
$ev = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1"
$ev.mediaTest
$ev.snippets | Select-Object snippetUid,title,mediaId,mediaPath
```

## 4. Runde mit Playback starten

```powershell
$r = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round?play=1&confirm=1"
$r | Select-Object ok,eventUid,soundSystemPlaybackRequested
```

Erwartung:

```text
Countdown sichtbar
Sound hörbar
Overlay bleibt nach Sound-Ende ca. 2 Sekunden sichtbar
Queue startet erst nach der Pause weiter
```

## 5. Recent Playback Log prüfen

```powershell
$log = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=20"
$log.items | Select-Object startedAt,audioEndedAt,gapStartedAt,gapEndedAt,finishedAt,status,soundId,label,source,category,playbackMs,gapMs | Format-Table -AutoSize
```

Erwartung:

```text
audioEndedAt liegt vor gapEndedAt
gapMs liegt ca. bei 2000
nächster startedAt liegt nach vorherigem gapEndedAt
```

## 6. Dashboard prüfen

```text
Dashboard -> System -> Sound-System
```

Sichtbar:

```text
Globale Sound-Pause
Zuletzt gespielt
```

## 7. Gemischter Test

```text
2 Alerts
2 Channelpoint-/UserSounds
1 EventSound / Runtime-Overlay
```

Bestätigt am 2026-06-17:

```text
GifSub 1-4      Audio 19,3 s   Gap 2 s
100-249 Bits    Audio 15,4 s    Gap 2 s
Mädchen         Audio 9,4 s     Gap 2 s
Husten          Audio 2,4 s     Gap 2 s
```
