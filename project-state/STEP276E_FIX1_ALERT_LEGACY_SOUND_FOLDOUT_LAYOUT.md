# STEP276E_FIX1 – Alert Legacy-Sound Foldout Layout

## Status

Fertig.

## Betroffene Datei

- `htdocs/dashboard/modules/alerts.js`

## Inhalt

Reiner UI-Fix für den Alert-Regel-Editor:

- „Alter Sound / Fallback“ zeigt den aktuellen Legacy-Sound sauber als `Aktuell: ...`.
- Der Text wird nicht mehr als kleine gequetschte `path-small`-Info direkt in die Überschrift gedrückt.
- Aufgeklappter Hinweis ist kompakter.

## Keine Funktionsänderung

- `sound_media_id` bleibt Vorrang.
- `sound_asset_id` bleibt Fallback.
- Play-/TTS-/Speicherlogik unverändert.
