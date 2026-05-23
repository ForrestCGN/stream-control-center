# CURRENT SYSTEM STATUS

Aktueller technischer Stand: STEP274G.

- Media-Core: zentrale Resolver-Schicht vorhanden.
- Sound-Media-Bridge: Audio-Medien koennen ueber `/api/sound/play-media` abgespielt werden.
- Command-Media-Bridge: Sound-Commands routen zu `/api/sound/play-media`, Video-/Animations-Commands zu `/api/video/play-media`.
- Video-Media-Bridge: eigener Overlay-Player unter `/overlays/_overlay-media-player.html`.

Wichtig: Sound-System-Core und `backend/modules/commands.js` wurden nicht umgebaut.
