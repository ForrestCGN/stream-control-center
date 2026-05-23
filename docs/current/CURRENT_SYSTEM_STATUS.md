# CURRENT_SYSTEM_STATUS

STEP274W FIX4 repariert die Birthday MediaPicker Import-Route. Nach dem Patch muss das Backend neu gestartet werden, damit `/api/birthday/admin/show/import-media` aktiv ist.

### STEP274Y - Birthday MediaPicker UX-Cleanup
- Birthday-MediaPicker zeigt die Zielkategorien direkt an.
- User-Song-/Party-Song-MediaFields nutzen jetzt birthday/user-songs bzw. birthday/party-songs statt general.
- Erfolgsmeldung nach Übernahme zeigt Registry-Kategorie und Sound-System-Zielpfad.
- Neue Kategorie birthday/party-songs wurde im Media-Core ergänzt.
