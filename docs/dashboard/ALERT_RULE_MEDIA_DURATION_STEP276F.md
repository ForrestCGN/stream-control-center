# STEP276F – Alert-Editor zeigt Media-Registry-Dauer korrekt

## Ziel

Der Alert-Regel-Editor zeigte bei aktivem Media-Registry-Sound teilweise noch die Dauer des alten Legacy-/Fallback-Sounds an. Beispiel: Media-Verwaltung zeigte 0:24, der Regel-Editor aber 11.2s.

## Umsetzung

`htdocs/dashboard/modules/alerts.js` nutzt bei Regeln mit `sound_media_id` jetzt bevorzugt:

- `sound_media_label`
- `sound_media_duration_ms`
- `sound_media_path`

Dadurch zeigen Listenansicht, Regel-Modal und Dauerberechnung den aktiven Sound korrekt an.

## Verhalten

- Media-Registry-Sound gesetzt: Label/Dauer kommen aus `sound_media_*`.
- Kein Media-Registry-Sound gesetzt: Anzeige/Dauer kommen wie bisher aus Legacy-Sound.
