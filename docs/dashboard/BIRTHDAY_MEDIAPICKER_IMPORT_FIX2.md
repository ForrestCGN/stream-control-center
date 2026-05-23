# STEP274W FIX2 – Birthday MediaPicker Import Route Fix

## Problem

STEP274W hat den Backend-Code nur teilweise gepatcht. Im Dashboard öffnete sich der MediaPicker, aber beim Übernehmen kam:

```text
Cannot POST /api/birthday/admin/show/import-media
```

Zusätzlich blieb eine grüne Erfolgsmeldung stehen, obwohl der Import fehlgeschlagen war.

## Fix

- `POST /api/birthday/admin/show/import-media` wird wirklich registriert.
- Die Import-Funktion wird top-level verfügbar gemacht.
- Eine versehentlich innerhalb von `handleBirthdayAssetUpload` eingefügte Funktionskopie wird entfernt.
- Das Dashboard löscht die grüne Notice, wenn der Import fehlschlägt.

## Test

```cmd
cd D:\Git\stream-control-center
node tools\apply_step274w_fix2_birthday_import_route.js
.\stepdone.cmd "STEP274W FIX2 Birthday Import Route"
```

Danach im Browser:

```text
Strg + F5
Birthday-System → Show/Medien
User eintragen, z. B. urlug
User-Song auswählen
MediaPicker öffnet sich
Audio auswählen
```

Erwartung:

- keine rote `Cannot POST` Meldung
- grüne Erfolgsmeldung nur bei echtem Erfolg
- unter `Geburtstage` sollte beim User der Show-Song sichtbar sein
- im Status unter User-Zuordnungen/Songs sollte der Song auftauchen
