# CHANGELOG

## STEP274W FIX4
- Birthday import-media Route als echte Runtime-Route registriert.
- Import-Funktion aus versehentlich verschachteltem Block gelöst und als Top-Level-Funktion gesetzt.
- Altes teilweises STEP274W-Tool durch Stub ersetzt.

## STEP274Y - Birthday MediaPicker UX-Cleanup
- Birthday Dashboard: Zielpfade/Kategorien im Show/Medien-Bereich sichtbar gemacht.
- Birthday Dashboard: User-Song MediaField auf birthday/user-songs gestellt.
- Birthday Dashboard: Party-Song MediaField auf birthday/party-songs gestellt.
- Media Backend: Standardkategorie birthday/party-songs ergänzt.

## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL

- MediaPicker-Filter `Zusatzkategorie` startet beim Öffnen auf `Alle Zusatzkategorien`.
- Upload-Zielkategorie bleibt unverändert getrennt über `config.categoryKey`.
- Hinweis im Picker ergänzt: Kategorieauswahl oben ist Filter, nicht Upload-Ziel.

## STEP274Z_FIX1_REMOVE_FILTER_HINT

- MediaPicker-Hinweis `Filter, nicht Upload-Ziel` aus dem sichtbaren Zusatzkategorie-Label entfernt.
- Verhalten bleibt unverändert: sichtbarer Filter startet auf `Alle Zusatzkategorien`, Upload-Ziel bleibt separat pro Button gesetzt.
