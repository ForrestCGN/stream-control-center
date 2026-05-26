# STEP276H_FIX2 – Alert Image Fallback Duplicate Label Cleanup

## Ziel
Die doppelte Beschriftung in den Grafik-Fallback-Bereichen entfernen.

## Änderung
- Die äußere Überschrift bleibt: `Alte Grafik / Fallback`.
- Die innere zweite Beschriftung `Alte Grafik` wurde entfernt.
- Es bleibt nur das eigentliche Dropdown sichtbar.

## Betroffene Datei
- `htdocs/dashboard/modules/alerts.js`

## Unverändert
- Speicherlogik
- Media-Registry-Vorrang
- Legacy-/Fallback-Logik
- Overlay-Verhalten
