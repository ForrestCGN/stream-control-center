# CURRENT_STATUS

Aktueller Stand: STEP277A Clip-Shoutout über Sound-System vorbereitet.

STEP277A integriert einen Video-/Clip-Shoutout ohne Streamer.bot-Auslöser. Der Trigger läuft über das bestehende Twitch-Presence- und Command-System, das Playback läuft über das Sound-System als locked Bundle.

Aktiv/erreicht:
- Neues Backend-Modul `backend/modules/clip_shoutout.js`.
- Route `GET/POST /api/clip-shoutout/run`.
- Kompatible Route `GET/POST /api/clip/shoutout`.
- Command-Seed für `!vso` mit Alias `clipso`/`videoso`.
- Twitch-Zieluser-Auflösung über vorhandenes Twitch-Modul.
- Clip-Liste per Helix und Playback-URL per Twitch-GQL.
- Clip-MP4 wird in `htdocs/assets/sounds/clip_shoutout` zwischengespeichert.
- Sound-System bekommt ein locked Bundle mit Video-Item.
- Optionales TTS nach dem Clip wird über `/api/tts/synthesize` vorbereitet und als zweites Bundle-Item angehängt.
- `sound_system_overlay.html` kann `visual.module="clip_shoutout"` im bisherigen Clip-Shoutout-Design darstellen.

Bewusst unverändert:
- Kein Streamer.bot-Auslöser.
- Keine eigene Clip-Queue.
- Keine OBS-URL-Umschaltung.
- Bestehende Clip-Erstellung über `/api/clip/create` bleibt unverändert.
- Bestehende Alert-/TTS-/VIP-/Mod-Sound-Logik bleibt erhalten.

Wichtiger Test nach Entpacken:
- Backend neu starten.
- OBS-Browserquelle für Sound-System-Overlay laden/prüfen.
- `/api/clip-shoutout/status` prüfen.
- Chat/Command-Test: `!vso @kanal`.
