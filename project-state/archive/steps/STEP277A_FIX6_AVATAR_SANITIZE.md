# STEP277A_FIX6 Avatar Sanitize

## Ziel

Clip-Shoutout behandelt ungültige Avatar-Werte sauber. Werte wie `false`, `"false"`, `null`, `"null"`, `undefined`, `"undefined"`, `0` oder nicht-HTTP-Strings werden nicht mehr als Avatar-URL verwendet.

## Geändert

- `backend/modules/clip_shoutout.js`
  - Avatar-URLs werden über `sanitizeAvatarUrl()` geprüft.
  - `/userinfo`-Antworten im Helix-Format `data[0].profile_image_url` werden weiter unterstützt.
  - `target.avatarUrl` und `visual.avatarUrl` bekommen nur echte `http/https`-URLs.
- `htdocs/overlays/sound_system_overlay.html`
  - Overlay verwirft ungültige Avatar-Werte ebenfalls.
  - Fallback-Lookup über `/userinfo?login=...` und `/api/twitch/user?login=...` bleibt erhalten.
  - Buchstaben-Fallback bleibt als letzte Sicherheit erhalten.

## Bewusst nicht geändert

- Clip-Suche/Fallback-Ranges aus FIX2.
- Video-Retry/Autoplay-Fallback aus FIX4/FIX5.
- Sound-System-Bundle, Queue, Prioritäten und Download-Cache.
- Keine Funktionalität wurde entfernt.
