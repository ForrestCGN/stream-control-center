# CHANGELOG

## STEP277A
- Neues Modul `clip_shoutout.js` ergänzt.
- Video-Shoutout läuft ohne Streamer.bot über das bestehende Command-System.
- `!vso` wird beim Modulstart in `command_definitions` vorbereitet, wenn noch nicht vorhanden.
- Clip-Zieluser wird über Twitch-Helper aufgelöst.
- Clips werden per Twitch Helix gelesen, ein Clip wird ausgewählt und als MP4 in `htdocs/assets/sounds/clip_shoutout` gecacht.
- Sound-System erhält ein locked Bundle mit Video-Item.
- Optionales TTS nach dem Clip wird per `/api/tts/synthesize` erzeugt und als zweites Bundle-Item eingefügt.
- `sound_system_overlay.html` rendert Clip-Shoutouts im vorhandenen VIP30/Altersheim-TV-Design.
- `config/clip_system.json` um `clipShoutout` erweitert.
- Keine bestehende Funktionalität entfernt.

## STEP276I
- Dokumentations- und Status-Sync für den abgeschlossenen Alert-MediaId-Block.
- Keine Code-Änderungen.
- Aktuellen Stand von STEP276B bis STEP276H_FIX3 zusammengefasst.
- Offene Redesign-Punkte für das Alert-Dashboard dokumentiert.
