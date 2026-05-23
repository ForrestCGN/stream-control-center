# CURRENT_SYSTEM_STATUS

STEP274W FIX4 repariert die Birthday MediaPicker Import-Route. Nach dem Patch muss das Backend neu gestartet werden, damit `/api/birthday/admin/show/import-media` aktiv ist.

### STEP274Y - Birthday MediaPicker UX-Cleanup
- Birthday-MediaPicker zeigt die Zielkategorien direkt an.
- User-Song-/Party-Song-MediaFields nutzen jetzt birthday/user-songs bzw. birthday/party-songs statt general.
- Erfolgsmeldung nach Übernahme zeigt Registry-Kategorie und Sound-System-Zielpfad.
- Neue Kategorie birthday/party-songs wurde im Media-Core ergänzt.

## STEP274Z_MEDIA_PICKER_FILTER_DEFAULT_ALL

MediaPicker: sichtbarer Zusatzkategorie-Filter startet beim Öffnen auf `Alle Zusatzkategorien`; Upload-Ziel bleibt weiterhin über die aufrufende Modulkonfiguration gesetzt.

## STEP275A_SOUND_SYSTEM_MEDIAID_DIRECT

Sound-System kann Medien aus der Media-Registry direkt per `mediaId` abspielen. Legacy-Sounds unter `assets/sounds` bleiben unverändert kompatibel.
