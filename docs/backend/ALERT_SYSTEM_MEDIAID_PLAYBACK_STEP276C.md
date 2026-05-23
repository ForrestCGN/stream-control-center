# STEP276C - Alert Sound MediaId Playback

## Ziel

Alert-Regeln koennen vorbereitete Media-Registry-Referenzen fuer Sound-Playback verwenden.

## Verhalten

- Wenn `alert_rules.sound_media_id` gesetzt ist, sendet das Alert-System `mediaId` an das Sound-System.
- Wenn `sound_media_id` leer ist, nutzt das Alert-System unveraendert den bestehenden Legacy-Weg ueber `sound_asset_id` / `sound_url` / `file`.
- Alte `alert_assets` und bestehende Dateien unter `assets/sounds/alerts` bleiben kompatibel.

## Betroffene Datei

- `backend/modules/alert_system.js`

## Nicht geaendert

- Kein Dashboard-MediaPicker.
- Kein Upload-Umbau.
- Keine Migration alter Assets.
- Keine automatische Loeschung alter Dateien.
