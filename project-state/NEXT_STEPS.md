# NEXT STEPS

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. `node --check backend\modules\video_media_bridge.js` ausfuehren.
3. `node --check backend\modules\commands_media.js` ausfuehren.
4. Backend neu starten/deployen.
5. `/api/video/media-bridge/status` pruefen.
6. OBS-Browserquelle anlegen: `http://127.0.0.1:8080/overlays/_overlay-media-player.html`.
7. Video direkt testen: `/api/video/play-media?mediaId=<videoId>`.
8. Danach Dashboard-Command mit Action-Typ `Video abspielen` speichern und testen.
