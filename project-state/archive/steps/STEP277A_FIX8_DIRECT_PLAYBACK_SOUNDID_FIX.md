# STEP277A_FIX8 Direct Playback SoundId Fix

## Ziel

Clip-Shoutout Direct Playback aus STEP277A_FIX7 reparieren.

## Befund

Das Sound-System akzeptiert externe `mediaUrl`/`videoUrl` erst nach STEP277A_FIX7. Das Clip-Shoutout-Bundle hat aber zusätzlich `soundId` gesetzt. Dadurch versuchte das Sound-System, diese `soundId` als vordefinierten Sound in der Sound-Liste zu finden. Da es kein Preset für jeden Twitch-Clip gibt, wurde das Bundle mit HTTP 500 abgelehnt.

## Änderung

- `backend/modules/clip_shoutout.js` setzt für Direct-Playback-Clip-Items keine eigene `soundId` mehr.
- Das Sound-System kann dadurch den Sound-Key aus der externen URL bzw. intern normalisieren.
- Direct Playback bleibt aktiv.
- Keine MP4-Dateien werden dauerhaft gespeichert.
- Sound-System, Overlay, Avatar-Fix und Video-Retry bleiben unverändert.

## Betroffene Dateien

- `backend/modules/clip_shoutout.js`
- `project-state/STEP277A_FIX8_DIRECT_PLAYBACK_SOUNDID_FIX.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `NEXT_CHAT_START_STEP277A_FIX8_DIRECT_PLAYBACK_SOUNDID_FIX.md`

## Test

- `node --check backend/modules/clip_shoutout.js`
- Danach Backend neu starten.
- `/api/clip-shoutout/status` soll `version: 7` und `step: STEP277A_FIX8` melden.
- `/api/clip-shoutout/run?target=bynexl&userLogin=forrestcgn&displayName=ForrestCGN` soll wieder erfolgreich ein Sound-System-Bundle erzeugen.
