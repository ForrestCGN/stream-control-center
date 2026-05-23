# NEXT_STEPS

1. STEP274W FIX4 ausführen.
2. `node -c backend\modules\birthday.js` prüfen.
3. Stepdone ausführen.
4. Backend neu starten.
5. Birthday-System → Show/Medien testen.

## Nach STEP274Y
- Birthday Show/Medien im Browser hart neu laden.
- User-Song über Birthday-Button hochladen und prüfen: Registry-Pfad birthday/user-songs, Sound-Kopie assets/sounds/birthday/.
- Party-Song MediaField prüfen: Upload-Ziel birthday/party-songs.

## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL_DONE

Abgeschlossen: MediaPicker trennt sichtbaren Kategorie-Filter und Upload-Ziel deutlicher.

## STEP275B_BIRTHDAY_STORE_MEDIAID_PLANNED

Nächster Step: Birthday soll neue Medien bevorzugt als `mediaId` speichern und beim Playback direkt ans Sound-System übergeben, statt Kopien nach `assets/sounds/birthday` zu erzeugen.

## STEP275C_DUPLICATE_CLEANUP_PLANNED

Optionaler nächster Step: Diagnose/Aufräumplan für alte doppelte Birthday-Dateien unter `assets/sounds/birthday`, ohne automatisch zu löschen.
