# Modul-Doku – Sound-System

Datei: `backend/modules/sound_system.js`  
Stand: `0.1.28` / `STEP_SOUND_LOG_1_RECENT_PLAYBACK_LOG`  
Zuletzt aktualisiert: 2026-06-16

## Aufgabe

Das Sound-System ist der zentrale Owner für Sound-Playback, Queue, Ausgabeziel, SoundBus-Events und Pausen zwischen Sounds. Andere Module sollen Sounds nicht direkt abspielen, sondern kontrolliert über das Sound-System gehen.

## Aktuelle neue Funktionen

### EventSound PreRoll-Gate

Für EventSound kann vor dem eigentlichen Playback ein Countdown/PreRoll laufen:

1. Sound-System reserviert das Item.
2. Runtime-Overlay bekommt `countdown.start`.
3. Nach Countdown folgt `guessing.start`.
4. Danach startet erst das echte Audio.
5. Nach Sound-Ende folgt die globale Post-Playback-Pause.
6. Danach `hide`/`finished` und Queue darf weiter.

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

Ziel: Nach einem Sound nicht sofort den nächsten Sound starten. EventSound-Overlay bleibt während dieser Pause sichtbar.

Dashboard-TODO: Diese Einstellung muss später im Dashboard konfigurierbar werden.

### Recent Playback Log

Neuer sauberer Verlauf für die zuletzt gespielten Sounds:

```text
GET /api/sound/recent-playback?limit=20
```

Erfasst:

- `soundId`
- `label`
- `file`
- `audioUrl`
- `source`
- `category`
- `target`
- `outputTarget`
- `startedAt`
- `finishedAt`
- `playbackMs`
- `gapMs`
- `status`
- `requestId`
- `correlationId`
- Fehler, falls vorhanden

Dashboard-TODO: Verlauf/Zuletzt gespielt mit Filtern anzeigen.

## Wichtige Routen

```text
GET /api/sound/status
GET /api/sound/eventbus/status
GET /api/sound/event-preroll/status
GET /api/sound/event-preroll/test?confirm=1
POST /api/sound/event-preroll/test?confirm=1
GET /api/sound/recent-playback?limit=20
```

## Diagnose-Befehle

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild
$s.postPlaybackGap
$s.playbackLog
```

```powershell
$log = Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=20"
$log.items | Format-Table startedAt,finishedAt,status,soundId,label,source,category,playbackMs,gapMs -AutoSize
```

## Bekannte Hinweise

- Overlay-Ausgabe kann in Browser/OBS wegen Autoplay blockieren. Deshalb darf EventSound nicht hart `outputTarget=overlay` setzen.
- EventSound nutzt `outputTarget=default`, damit das Sound-System die Ausgabe entscheidet.
- Discord-Routing für EventSound ist noch nicht final entschieden.
- Die globale 2s Pause darf normale Sounds/Alerts nicht kaputtmachen; bisher wurden Alerts und Sounds sauber gehört.
