# SOUND-GAP-1 / EVENT-SOUND-5D – Globale Sound-Pause + EventSound Overlay-Hold

Stand: 2026-06-16

## Ziel
Nach jedem Sound bleibt das Sound-System kurz reserviert, damit nicht sofort der nächste Sound/Alert/Request startet. Für EventSound bleibt das Runtime-Overlay während dieser Pause sichtbar und wird erst danach versteckt.

## Geänderte Datei
- `backend/modules/sound_system.js`

## Version
- `sound_system` von `0.1.26` auf `0.1.27`
- Build: `STEP_SOUND_GAP_1_POST_PLAYBACK_GAP_EVENT_HOLD`

## Verhalten
- Globale Post-Playback-Pause vorbereitet/aktiv: `2000ms`
- Queue-Start wird während der Pause blockiert.
- Neue Requests werden während der Pause gequeued statt sofort gestartet.
- EventSound-PreRoll/Runtime-Overlay sendet `hide` erst nach der Pause.
- Sound-Playback selbst, Media-Auflösung, Discord-Routing und Dashboard bleiben unverändert.

## Neue/erweiterte Statusdaten
Im Sound-Status ist `postPlaybackGap` sichtbar:
- `active`
- `durationMs`
- `remainingMs`
- `soundId`
- `requestId`
- `holdEventRuntimeOverlay`
- `blockQueueStart`

## Test
```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild
$s.postPlaybackGap
```

EventSound-Test:
```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/reset-test-state?confirm=1"
$ev = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/create-test-event?confirm=1&useRealMedia=1"
$r = Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/stream-events/sound-runtime/next-round?play=1&confirm=1"
```

Erwartung:
- Countdown sichtbar
- Ton hörbar
- nach Sound-Ende ca. 2 Sekunden Hold
- erst danach Overlay hide
- in dieser Zeit startet kein weiterer Sound direkt

## Wichtig
Dashboard-/DB-Konfiguration ist noch nicht umgesetzt. Siehe `docs/current/TODO_EVENT_SOUND_DASHBOARD.md`.
