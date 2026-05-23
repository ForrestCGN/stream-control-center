# Alert Rule Image MediaId STEP276H

STEP276H ergänzt die produktive Nutzung von `alert_rules.image_media_id`.

Die Bildquelle wird beim Rendern so aufgelöst:

1. `image_media_id` gesetzt → Media-Registry-Bild (`image_media_url`/`image_media_path`)
2. kein `image_media_id` → Legacy-Bild (`image_url`)
3. beides leer → kein Regelbild

Das alte `image_asset_id` bleibt erhalten und wird nicht entfernt.
