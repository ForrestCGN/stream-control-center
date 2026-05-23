# CURRENT_SYSTEM_STATUS

## STEP276B_ALERT_RULE_MEDIA_COLUMNS

Alert-System vorbereitet für Media-Registry-Referenzen in Regeln.

- `alert_rules.sound_media_id` und `alert_rules.image_media_id` werden per Schema-Version 6 sanft ergänzt.
- `saveRule()` kann die neuen Felder speichern.
- Bestehende `alert_assets`, `sound_asset_id`, `image_asset_id` und Legacy-Pfade bleiben unverändert.
- Noch kein Dashboard-Umbau und noch kein Playback per `mediaId`.

## STEP275B_FIX1_MEDIA_UPLOAD_FIELD_ORDER

MediaPicker-Upload-Reihenfolge repariert: `moduleKey`/`categoryKey` werden vor der Datei übertragen, damit Multer den physischen Zielordner korrekt wählt.

## STEP275B_BIRTHDAY_MEDIAID_NO_DUPLICATE_COPY

Birthday MediaPicker-Import erzeugt keine zusätzliche Sound-Kopie mehr, sondern speichert Media-Registry-Referenzen. Legacy-Sounds bleiben weiterhin kompatibel.

## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

Sound-System kann Medien aus der Media-Registry direkt per `mediaId` abspielen. Legacy-Sounds unter `assets/sounds` bleiben unverändert kompatibel.

## STEP274Z_FIX1_REMOVE_FILTER_HINT

MediaPicker: Der sichtbare Zusatztext unter/bei `Zusatzkategorie` wurde entfernt. Funktional bleibt die Trennung von Filter und Upload-Ziel bestehen.

## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL

MediaPicker: sichtbarer Zusatzkategorie-Filter startet beim Öffnen auf `Alle Zusatzkategorien`; Upload-Ziel bleibt weiterhin über die aufrufende Modulkonfiguration gesetzt.

### STEP274Y - Birthday MediaPicker UX-Cleanup

- Birthday-MediaPicker zeigt die Zielkategorien direkt an.
- User-Song-/Party-Song-MediaFields nutzen jetzt birthday/user-songs bzw. birthday/party-songs statt general.
- Erfolgsmeldung nach Übernahme zeigt Registry-Kategorie und Sound-System-Zielpfad.
- Neue Kategorie birthday/party-songs wurde im Media-Core ergänzt.

STEP274W FIX4 repariert die Birthday MediaPicker Import-Route. Nach dem Patch muss das Backend neu gestartet werden, damit `/api/birthday/admin/show/import-media` aktiv ist.
