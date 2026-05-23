# ALERT_SYSTEM_MEDIA_RULE_COLUMNS_STEP276B

## Kurzfassung

STEP276B ergänzt im Alert-System optionale Media-Registry-Spalten für Regeln:

- `alert_rules.sound_media_id`
- `alert_rules.image_media_id`

Damit können spätere Steps Alert-Sounds und Alert-Grafiken per zentraler Media-Registry referenzieren.

## Kompatibilität

Bestehende Legacy-Felder bleiben aktiv:

- `sound_asset_id`
- `image_asset_id`
- `alert_assets.file_path`
- `alert_assets.public_url`
- `assets/sounds/alerts`
- `assets/images/alerts`

Es wurde keine bestehende Funktionalität entfernt.

## Nächster technischer Schritt

STEP276C soll beim Sound-System-Bundle bevorzugt `sound_media_id` als `mediaId` übergeben.
Wenn keine `sound_media_id` gesetzt ist, bleibt der bisherige `file`-Fallback über `sound_url` aktiv.
