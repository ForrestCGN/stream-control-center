# CURRENT SYSTEM STATUS

Aktueller technischer Stand: STEP274F.

- Media-Core: zentraler Resolver vorhanden.
- Sound-Media-Bridge: Media-Assets koennen ueber `/api/sound/play-media` abgespielt werden.
- Command-Media-Bridge: Dashboard setzt sound_play/video_play-Commands direkt auf `/api/sound/play-media?mediaId=<id>`.

Wichtig: `backend/modules/commands.js` wurde nicht umgebaut. Die bestehende Command-Pipeline bleibt erhalten und nutzt die gespeicherte Ziel-URL.
