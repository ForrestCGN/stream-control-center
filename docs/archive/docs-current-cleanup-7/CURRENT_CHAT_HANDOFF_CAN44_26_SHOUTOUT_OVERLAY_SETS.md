# CURRENT_CHAT_HANDOFF_CAN44_26_SHOUTOUT_OVERLAY_SETS

Stand:
- Nutzer möchte CAN44_24f/H15 Layout erstmal lassen.
- CAN44_25 hatte getrennte Headline/Subline Textkeys.
- Nutzer wollte passende Paare statt zufälliger unabhängiger Headline/Subline.
- CAN44_26 ergänzt overlaySets als echtes Paar-System.

Dateien:
- backend/modules/clip_shoutout.js
- htdocs/overlays/sound_system_overlay.html

Neue Route:
- GET  /api/clip-shoutout/overlay-sets
- POST /api/clip-shoutout/overlay-sets

Kompatibilität:
- shoutout.overlay.headline und shoutout.overlay.subline bleiben als Fallback.
- overlaySets wird zuerst genutzt.
- Kein Playback-/Bus-/Queue-Code wurde bewusst verändert.

Offen:
- Konkrete Dashboard-UI-Kartenansicht muss noch in die echte Dashboard-Datei integriert werden, sobald die aktuelle Dashboard-Moduldatei zuverlässig vorliegt.
- API dafür ist vorbereitet.
