# CURRENT_CHAT_HANDOFF_CAN44_25_SHOUTOUT_TEXTS

Stand:
- CAN44_24f/H15 Layout wurde als vorläufig akzeptiert.
- CAN44_25 ergänzt Shoutout-Overlay-Texte und dashboardfähige Einstellungen.

Geänderte Dateien:
- backend/modules/clip_shoutout.js
- htdocs/overlays/sound_system_overlay.html

Neue Textkeys:
- shoutout.overlay.headline
- shoutout.overlay.subline

Kategorie:
- shoutout.overlay / Shoutout Overlay

API:
- GET /api/clip-shoutout/texts
- POST /api/clip-shoutout/texts
- GET /api/clip-shoutout/settings
- POST /api/clip-shoutout/settings

Layout:
- H15/CAN44_24f bleibt Layout-Basis.
- Sound-System-Overlay liest optional visual.brand.

Offen:
- Nach Live-Test prüfen, ob die bestehende Dashboard-Textseite die Kategorie `shoutout.overlay` automatisch anzeigt.
- Falls nicht, muss die konkrete Dashboard-Datei hochgeladen oder aus GitHub/dev zuverlässig bereitgestellt werden, dann kann die UI-Seite gezielt angebunden werden.
