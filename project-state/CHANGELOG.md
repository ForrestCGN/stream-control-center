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

## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

- Sound-System kann Media-Registry-Assets direkt per `mediaId` / `media_id` abspielen.
- `/api/media/resolve?useCase=sound_system` markiert `assets/media/...`-Assets als kompatibel, wenn direkte mediaId-Wiedergabe möglich ist.
- Keine Entfernung bestehender `assets/sounds/...`-Kompatibilität.

## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

- Birthday MediaPicker-Import speichert neue Medien als `mediaid:<id>` statt Kopien unter `assets/sounds/birthday` zu erzeugen.
- Birthday-Sound-Bundles übergeben bei `mediaid:<id>` direkt `mediaId` an das Sound-System.
- Legacy-Dateien unter `assets/sounds/birthday` bleiben kompatibel.

## STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER

- MediaPicker sendet Upload-Metadaten (`type`, `moduleKey`, `categoryKey`) vor der Datei.
- Zusätzlich Query-Fallback für `/api/media/upload` ergänzt.
- Behebt Fälle, in denen Dateien physisch unter `assets/media/general/general` landeten, obwohl die Registry `birthday/user-songs` zeigte.
