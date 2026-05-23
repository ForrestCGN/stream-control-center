# CURRENT SYSTEM STATUS

## Media / Sound / Commands

Aktueller Stand: **STEP274J**.

Die zentrale Medienverwaltung verwaltet Dateien, Media-IDs, Metadaten und Resolver-Informationen. Das Sound-System ist der offizielle zentrale Abspielpunkt für Audio, Video und Animation.

Offizieller Playback-Endpunkt:

```text
/api/sound/play-media?mediaId=<id>
```

Offizielles Playback-Overlay:

```text
/overlays/sound_system_overlay.html
```

Commands mit `sound_play` oder `video_play` sollen auf den Sound-Media-Hub routen. Gespeicherte Commands können geprüft werden über:

```text
/api/commands/media-command-check?trigger=<trigger>
```

`/api/video/*` und `_overlay-media-player.html` sind deprecated/test-only und nicht der offizielle Weg.
