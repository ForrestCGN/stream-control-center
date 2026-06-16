# Testflow – EventSound Runtime und Sound-System

Stand: 2026-06-16

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
sound_system 0.1.28 / STEP_SOUND_LOG_1_RECENT_PLAYBACK_LOG
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
$r.playbackResult.soundSystemResult.item | Select-Object soundId,label,file,audioUrl,mediaUrl,durationMs,hasAudio,target,outputTarget
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
$log.items | Format-Table startedAt,finishedAt,status,soundId,label,source,category,playbackMs,gapMs -AutoSize
```

## 6. EventBus Diagnose bei Bedarf

```powershell
$bus = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/eventbus/status"
$bus.recentEvents |
  Where-Object { $_.action -in @("started","finished","client.error") } |
  Select-Object at,action,reason,@{n="soundId";e={$_.context.soundId}},@{n="label";e={$_.context.label}},@{n="file";e={$_.context.file}} |
  Format-Table -AutoSize
```
