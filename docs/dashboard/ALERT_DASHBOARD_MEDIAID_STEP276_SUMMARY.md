# Alert-Dashboard MediaId Integration - STEP276 Zusammenfassung

## Sound

Der Regel-Editor enthält jetzt:

- Sound aus Media-Registry
- Alter Sound / Fallback

Priorität:

1. Media-Registry-Sound
2. alter Legacy-Sound
3. kein Sound

## Regel-Grafik

Der Regel-/Medienbereich enthält zusätzlich eine Auswahl für Regel-Grafik/Bild aus der Media-Registry.

Priorität:

1. `image_media_id`
2. `image_asset_id` / `image_url`
3. keine Grafik

## Design-Grafik über dem Alert

Die vorhandene Top-Grafik kann aus der Media-Registry gewählt werden. Alte Grafik bleibt Fallback.

## Daueranzeige

Bei Media-Registry-Sounds wird die Dauer aus `media_assets` angezeigt. Damit wird nicht mehr versehentlich die Legacy-Sound-Dauer gezeigt.

## Bekannte UI-Schwäche

Der aktuelle Medienbereich ist funktional, aber nicht final schön. Für das spätere Redesign:

- weniger verschachtelte Boxen
- klare Bereiche/Tabs
- Legacy-Fallbacks weniger dominant
- keine langen Erklärtexte in kleinen Kacheln
- einheitliche Kacheloptik
