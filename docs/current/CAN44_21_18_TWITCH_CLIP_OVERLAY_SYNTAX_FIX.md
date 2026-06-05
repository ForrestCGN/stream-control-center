# CAN-44.21.18 Twitch-Clip Overlay Syntax Fix

## Ziel
Korrektur des CAN-44.21.17 Overlay-Fixes.

## Problem
In `htdocs/overlays/sound_system_overlay.html` war durch die vorherige Änderung eine kaputte Funktionsdeklaration entstanden:

```js
async function finishVideoPlayback      async function finishVideoPlayback(reason, extra) {
```

Dadurch konnte die neue Twitch-Clip-Playback-Logik im Browser nicht zuverlässig ausgeführt werden.

## Änderung
Die Funktionsdeklaration wurde korrigiert zu:

```js
async function finishVideoPlayback(reason, extra) {
```

## Nicht geändert
- Keine Änderung an `backend/modules/clip_shoutout.js`
- Keine Änderung an `backend/modules/sound_system.js`
- Keine DB-Änderung
- Keine Queue- oder Cooldown-Logik geändert

## Test
Das HTML-Script wurde extrahiert und per `node --check` syntaktisch geprüft.
