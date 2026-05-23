# STEP274U – Reusable MediaField Component

## Ergebnis

Ein wiederverwendbares Dashboard-Feld `MediaField` wurde ergänzt. Es kapselt die Nutzung von `MediaPicker.open(...)`, schreibt die ausgewählte `mediaId` in ein Ziel-Input, aktualisiert Label/Vorschau und feuert ein `media-field:change` Event.

## Dateien

- `htdocs/dashboard/components/media_field.js`
- `htdocs/dashboard/components/media_field.css`
- `htdocs/dashboard/index.html`
- `docs/dashboard/MEDIA_FIELD_INTEGRATION_STANDARD.md`

## Zweck

Module mit Upload-/Medienbedarf sollen künftig keine eigene Upload-/Picker-Logik bauen. Sie nutzen die zentrale Registry über `MediaField`/`MediaPicker`.

## Nicht geändert

- Keine bestehenden Modul-Workflows wurden umgebaut.
- Keine Datenbankänderung.
- Keine Media-Dateien verändert.
