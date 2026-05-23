# STEP276F – Alert-Regeln mit Media-Registry-Dauer anreichern

## Ziel

Wenn eine Alert-Regel `sound_media_id` nutzt, muss die Regel-API die Details aus der Media-Registry zurückgeben. Der Dashboard-Regel-Editor darf bei aktivem Media-Registry-Sound nicht mehr die Dauer des alten Legacy-/Fallback-Sounds anzeigen.

## Umsetzung

`backend/modules/alert_system.js` reichert Regeln jetzt per `LEFT JOIN media_assets` an:

- `sound_media_label`
- `sound_media_duration_ms`
- `sound_media_path`
- `sound_media_url`
- `sound_media_type`
- vorbereitet auch für `image_media_*`

Für Playback, Renderdaten und automatische Alert-Dauer gilt:

1. Wenn `sound_media_id` gesetzt ist und `sound_media_duration_ms` vorhanden ist, wird diese Dauer verwendet.
2. Sonst bleibt die bisherige Legacy-Dauer aus `sound_duration_ms` erhalten.
3. Bestehende `sound_asset_id`/`sound_url`-Logik bleibt Fallback.

## Nicht geändert

- Keine Upload-Logik geändert.
- Keine Media-Registry-Tabellen geändert.
- Keine Legacy-Sounds entfernt.
- Kein Dashboard-Layout-Feinschliff in diesem Step.
