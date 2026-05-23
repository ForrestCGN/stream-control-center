# NEXT STEPS

- STEP274E live testen:
  - `/api/sound/media-bridge/status`
  - `/api/sound/play-media?mediaId=325&volume=60`
  - Dashboard Commands -> Sound-Aktion -> Medium auswaehlen -> speichern.
- Danach STEP274F: Command-Katalog/Defaults und echte Command-Ausfuehrung fuer `sound_play`/`video_play` testen.
- Pruefen, ob `_media_registry` Cache langfristig reicht oder ob Sound-System-Core spaeter direkt media-registry-aware werden soll.
