# STEP276H Alert Rule Image MediaId

Ziel: Die bereits vorbereitete `image_media_id` wird im Alert-Regel-Editor nutzbar und beim Rendern bevorzugt.

## Änderungen

- `alert_rules.image_media_id` kann im Regel-Editor über den zentralen MediaPicker gesetzt werden.
- Alte `image_asset_id` bleibt als Fallback erhalten.
- Backend speichert `image_media_id`, `image_asset_id` und ein passendes `image_mode`.
- Render-Payload bevorzugt Media-Registry-Bild über `image_media_url` und fällt sonst auf `image_url` zurück.
- `badgeImageUrl` wird ebenfalls gesetzt, damit bestehende/future Overlay-Pfade dieselbe Bildquelle nutzen können.

## Nicht geändert

- Keine Legacy-Felder entfernt.
- Kein Overlay-Redesign.
- Keine bestehenden Alert-Sounds/TTS-Logik geändert.

## Test

- `node --check backend/modules/alert_system.js`
- `node --check htdocs/dashboard/modules/alerts.js`
