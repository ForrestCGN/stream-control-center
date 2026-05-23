# STEP274W FIX3 – Birthday import-media Route Runtime-Fix

Dieser Fix repariert den teilweise angewendeten STEP274W-Stand.

## Problem

Das Dashboard konnte den MediaPicker öffnen, aber die Übernahme endete mit:

`Cannot POST /api/birthday/admin/show/import-media`

Ursache: Der Import-Helper war durch einen vorherigen Patch versehentlich innerhalb von `handleBirthdayAssetUpload` gelandet und die Route wurde nicht sauber registriert.

## Fix

- `importBirthdayMediaAsset` liegt wieder top-level im Backend-Modul.
- `POST /api/birthday/admin/show/import-media` wird direkt nach dem Legacy-Upload-Endpunkt registriert.
- Alte defekte Apply-Tools werden zu sicheren Stubs.
- Keine DB-Migration.
- Keine Entfernung bestehender Legacy-Upload-Funktionen.

## Test

1. Backend neu starten.
2. Dashboard hart neu laden.
3. Birthday-System → Show/Medien.
4. User bei User-Song eintragen.
5. User-Song auswählen.
6. Nach der Auswahl muss kein `Cannot POST` mehr erscheinen.
