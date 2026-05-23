# CURRENT SYSTEM STATUS

## Media / Sound / Commands

Aktueller Stand: STEP274H.

Die Medienverwaltung ist die zentrale Registry fuer Media-Assets. Das Sound-System ist der offizielle zentrale Abspielpunkt fuer Audio, Video und Animationen.

Offizieller Playback-Weg:

```text
media_assets / Media-ID → /api/sound/play-media?mediaId=<id> → Sound-System → sound_system_overlay.html
```

Video/Animation nutzt kein separates neues Overlay als offiziellen Pfad. Das vorhandene `sound_system_overlay.html` bleibt zentraler Player.
