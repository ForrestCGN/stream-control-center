# CURRENT SYSTEM STATUS

Stand: STEP274I – Sound-System als offizieller Media-Playback-Hub.

## Architektur

- Medienverwaltung (`media_assets`) verwaltet Dateien, IDs, Typen, Pfade, Dauer und Metadaten.
- Sound-System spielt Medien zentral ab.
- Offizieller Playback-Endpunkt: `/api/sound/play-media?mediaId=<id>`
- Offizielles OBS-Overlay: `/overlays/sound_system_overlay.html`
- Commands `sound_play` und `video_play` routen beide auf den Sound-Media-Hub.
- `/api/video/*` und `_overlay-media-player.html` sind deprecated Testpfade und nicht mehr offizieller Weg.
