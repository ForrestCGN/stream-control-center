# CAN-44.21.23 - Twitch Clip Silent Reset

## Ziel
Der `twitch_clip`-Start im Sound-System-Overlay soll keine alte/leere ClipCard mehr kurz einblenden, bevor der eigentliche Clip sichtbar wird.

## Geändert
- `hideClipCard(silent)` ergänzt.
- `hideVideo(options)` kann die ClipCard jetzt ohne Outro-Animation sofort verstecken.
- `stopAudio(options)` reicht den Silent-Reset weiter.
- `playTwitchClipItem()` nutzt beim Start `stopAudio({ silentClipCard: true })`.
- Die ClipCard bleibt beim Start von `twitch_clip` auf `display:none`, bis das Video wirklich vorbereitet und startbereit ist.

## Nicht geändert
- Kein IFrame.
- Kein Twitch-Embed als Standard.
- Keine Queue-/Backend-Logik geändert.
- Keine OBS-Direktsteuerung.
- Keine Streamer.bot-Wait-Logik.
- Keine Twitch-GQL-/MP4-Resolver-Änderung gegenüber CAN-44.21.22.

## Test
- JavaScript aus `sound_system_overlay.html` extrahiert.
- `node --check overlay_step462_script.js` erfolgreich.

## Erwartung
Beim `!vso`-Start soll nicht mehr zuerst eine alte/leere ClipCard kurz aufblitzen. Das Overlay soll erst mit dem vorbereiteten Clip sichtbar werden.
