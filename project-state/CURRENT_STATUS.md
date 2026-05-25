# CURRENT_STATUS

STEP458: Shoutout Display Queue mit 2-Minuten-Abstand und Twitch-Wait-Fix aktiv.

Aktuelle wichtige Version:

- `backend/modules/clip_shoutout.js`: `0.2.1`

Verhalten:

- `!so @user` nimmt den Shouti auf.
- Shouti-Anzeigen starten nicht mehr direkt hintereinander, sondern warten 2 Minuten.
- Der offizielle Twitch-Shoutout bleibt eine getrennte Queue nach Anzeige-Ende.
