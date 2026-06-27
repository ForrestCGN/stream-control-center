# CAN-44.21.17 - Twitch-Clip Overlay Playback Fix

## Ausgangslage

Nach CAN-44.21.16 wurde `clip_shoutout` korrekt auf `clipPlaybackMode: twitch_clip` geladen. Das Sound-System nahm das Bundle an und startete ein Item mit `mediaType: twitch_clip`. Im Live-Test wurde jedoch nur der Clip-Rahmen sichtbar, nicht das Video.

EventBus-Befund: Das Item wurde gestartet und spaeter per `overlay_fallback_finished` beendet. Es gab keinen sichtbaren Videostart.

## Ursache

Der Overlay-Handler fuer `twitch_clip` zeigte die ClipCard bereits beim Laden und uebergab danach an den normalen Video-Handler. Dadurch wurde die ClipCard erneut aufgebaut. Ausserdem wurde beim ersten Videostart die signierte Twitch-Playback-URL durch CacheBust veraendert. Signierte Twitch-URLs sollen unveraendert abgespielt werden.

## Aenderung

Betroffene Datei:

- `htdocs/overlays/sound_system_overlay.html`

Umgesetzt:

- `playTwitchClipItem(...)` spielt den aufgeloesten Twitch-Clip direkt ab.
- Twitch-Clip-Startversuche verwenden `cacheBust: false`.
- Die ClipCard wird nicht mehr durch Ruecksprung in `playVideoFile(...)` doppelt aufgebaut.
- `client/audio-started`, `client/audio-ended` und `client/error` melden `mediaType: twitch_clip` und `clipId`.

## Nicht geaendert

- Keine DB-Aenderung.
- Kein Umbau der Queue.
- Kein Entfernen des direkten Playback-Wegs im Backend.
- Kein OBS-Direktsteuerungsweg.

## Hinweis Dashboard-Design

Die langfristige Vorgabe bleibt: Overlays sollen spaeter dashboardfaehig bearbeitbar werden, inklusive Position, Groesse, Farben, Glow, Rahmen, Avatar, Texten und Presets fuer andere Streamer.
