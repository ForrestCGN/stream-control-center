# STEP276D_FIX1 – Alert Rule MediaPicker Layout Fix

## Ziel

Kleiner Dashboard-Layout-Fix fuer den Alert-Regel-Editor nach STEP276D.

Der MediaPicker war funktional vorhanden, aber im Modal unsauber dargestellt: Der Button sass zu eng im Grid und der Entfernen-Button rutschte optisch in eine zweite Zeile.

## Geaendert

- `htdocs/dashboard/modules/alerts.js`
- Media-Registry-Sound-Zeile nutzt jetzt eine eigene CSS-Klasse `sound-media-picker-row`.
- Grid-Spalten: Eingabefeld, Button, Entfernen-Button.
- Button-Text von `MediaPicker` auf `Auswaehlen` gekuerzt.
- Entfernen-Button bekommt feste Breite und Tooltip/ARIA-Label.

## Nicht geaendert

- Keine Backend-Aenderung.
- Keine API-Aenderung.
- Keine Speicherlogik-Aenderung.
- Legacy-Sound/Fallback bleibt unveraendert.
- `sound_media_id` bleibt das priorisierte Feld aus STEP276C/276D.

## Tests

- `node --check htdocs/dashboard/modules/alerts.js` OK
- Funktionsvergleich: 149 vorher / 149 nachher / 0 entfernt
