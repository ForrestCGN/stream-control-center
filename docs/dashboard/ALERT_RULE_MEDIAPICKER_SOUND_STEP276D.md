# Alert-Regel MediaPicker Sound - STEP276D

STEP276D bindet den vorhandenen zentralen `MediaPicker` in den Alert-Regel-Editor ein.

## Zweck

Neue Alert-Sounds sollen künftig nicht mehr zwingend doppelt unter `htdocs/assets/sounds/alerts` landen. Stattdessen kann der Regel-Editor eine Datei aus der zentralen Media-Registry auswählen und deren ID als `sound_media_id` speichern.

## UI

Im Regel-Modal:

- **Sound aus Media-Registry**
  - öffnet den zentralen MediaPicker
  - speichert `sound_media_id`
- **Legacy-Sound / Fallback**
  - bleibt vollständig erhalten
  - speichert weiterhin `sound_asset_id`

## Priorität

Das Backend aus STEP276C spielt bevorzugt `sound_media_id`.
Ist keine `sound_media_id` gesetzt, läuft alles wie bisher über `sound_asset_id` / `sound_url`.

## MediaPicker-Konfiguration

```js
{
  moduleKey: 'alerts',
  categoryKey: '<alert type>',
  allowedTypes: ['audio'],
  view: 'module'
}
```

## Keine entfernte Funktionalität

- Legacy-Sound-Auswahl bleibt sichtbar.
- Legacy-Preview-Button bleibt erhalten.
- Bestehende Regeln bleiben kompatibel.
- Keine automatische Datei-Migration.
