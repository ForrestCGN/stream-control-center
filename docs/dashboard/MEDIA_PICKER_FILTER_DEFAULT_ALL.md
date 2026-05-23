# STEP274Z - MediaPicker Filter startet auf Alle Zusatzkategorien

## Ziel

Beim Öffnen des zentralen MediaPickers soll der sichtbare Filter `Zusatzkategorie` zuerst auf `Alle Zusatzkategorien` stehen.

Das Upload-Ziel bleibt davon getrennt:

- Birthday Intro: `birthday / intro`
- Birthday Standardsong: `birthday / default-song`
- Birthday User-Song: `birthday / user-songs`
- Birthday Party-Song: `birthday / party-songs`

## Warum

Der sichtbare Kategorie-Filter steuert nur die Medienliste im Picker.
Das Upload-Ziel wird separat über `config.categoryKey` gesetzt und bleibt weiterhin korrekt.

## Betroffene Datei

- `htdocs/dashboard/components/media_picker.js`
