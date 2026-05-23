# CURRENT SYSTEM STATUS

Aktuell: STEP274G1.

Die zentrale Medienverwaltung liefert Media-IDs. Commands fuer `sound_play` und `video_play` routen ueber `/api/sound/play-media?mediaId=<id>`.

Die Ausgabe erfolgt ueber das bestehende `sound_system_overlay.html`, das bereits Audio- und Video-Playback unterstuetzt. Ein separates neues Media-Player-Overlay ist fuer diesen Pfad nicht noetig.
