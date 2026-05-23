# CHANGELOG

## STEP274E1
- Sound-Media-Bridge `backend/modules/sound_media_bridge.js` ergaenzt.
- Neue Route `/api/sound/play-media` spielt Media-Assets ueber den bestehenden Sound-System-Flow ab.
- Neue Route `/api/sound/media-bridge/status` ergaenzt.
- Command-Media-Dashboard-Bruecke setzt fuer Medienauswahl automatisch `/api/sound/play-media?mediaId=<id>`.
- Bestehende Medien werden nicht verschoben oder geloescht.

## STEP274D
- Zentralen Media-Resolver in `media.js` ergaenzt.
- Commands-Media-Bridge nutzt Media-Resolver statt eigene Pfadlogik.
