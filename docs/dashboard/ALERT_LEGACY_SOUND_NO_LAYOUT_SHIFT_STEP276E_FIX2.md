# STEP276E_FIX2 – Alert Legacy-Sound Foldout ohne Layout-Shift

## Ziel

Der aufgeklappte Bereich **Alter Sound / Fallback** darf den restlichen Medien-&-Design-Bereich nicht mehr nach unten verschieben.

## Änderung

- Nur `htdocs/dashboard/modules/alerts.js` geändert.
- Der Inhalt des Legacy-Foldouts wird beim Öffnen als kleines Overlay innerhalb des rechten Blocks angezeigt.
- Die eigentliche Grid-Höhe bleibt stabil.
- Speicherlogik, Sound-Auswahl, Media-Registry-Vorrang und Legacy-Fallback bleiben unverändert.

## Test

- `node --check htdocs/dashboard/modules/alerts.js` OK.
- Funktionsanzahl unverändert.
- Keine Funktionalität entfernt.
