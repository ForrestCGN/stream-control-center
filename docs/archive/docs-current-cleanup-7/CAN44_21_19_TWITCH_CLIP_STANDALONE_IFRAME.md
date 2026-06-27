# CAN-44.21.19 Twitch Clip Standalone Iframe Fallback

Ziel: Twitch-Clip-Shoutouts innerhalb der bestehenden Sound-System-Queue abspielen, aber den bewährten bestehenden Clip-Player `_overlay-clip_player.html` verwenden.

Änderungen:
- `sound_system_overlay.html` nutzt für `mediaType: twitch_clip` einen Fullscreen-Iframe auf `/overlays/_overlay-clip_player.html?clipId=...&user=...`.
- Die Sound-System-Queue bleibt Dirigent und wartet weiterhin über `durationMs`/Fallback.
- `client/audio-started` und `client/audio-ended` werden vom Sound-System-Overlay gemeldet, damit Bundle-Lock und Queue sauber bleiben.
- Kein Streamer.bot-Wait, keine direkte OBS-Steuerung.

Hinweis:
- Diese Lösung ist bewusst robuster, weil sie den alten funktionierenden ClipPlayer-Kern wiederverwendet, statt die Twitch-Clip-GQL-/Video-Logik im Sound-System-Overlay erneut nachzubauen.
