# CAN-44.21.20 - Clip Player GQL Diagnose/Fix

Ziel: `_overlay-clip_player.html` isoliert reparieren/diagnostizieren, ohne den Sound-System-Queue-Weg weiter zu verändern.

## Änderungen

- Userinfo wird jetzt same-origin geladen: `/userinfo?login=...` statt `http://localhost:8080/...`.
- Der Player zeigt Fehler sichtbar im Overlay an, statt nur `console.error` zu schreiben.
- Twitch-GQL wird mit mehreren Varianten versucht:
  - explizite Query mit `playbackAccessToken`
  - persisted query Version 1
  - persisted query Version 2
- Video-Start wartet auf `canplay/loadeddata` und zeigt Video erst danach.
- Offizieller Twitch-Embed ist bewusst **nicht** Standard, damit keine FSK18-/Mature-Bestätigungsseite im OBS-Overlay landet.

## Betroffene Datei

- `htdocs/overlays/_overlay-clip_player.html`

## Test-URL

`http://127.0.0.1:8080/overlays/_overlay-clip_player.html?clipId=HomelyHorribleElkBrokeBack-ZMES1OqWz_JbkKU-&user=pretos1`

## Hinweis

Nach dem Entpacken muss nur die Browserquelle/OBS neu geladen werden. Ein Node-Neustart ist für diese HTML-Änderung nicht nötig.
