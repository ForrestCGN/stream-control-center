# NEXT_STEPS

## Direkt nach STEP274A

1. Dateien einspielen.
2. Syntax prüfen:
   ```bat
   node --check backend\modules\media.js
   ```
3. Standardabschluss:
   ```bat
   .\stepdone.cmd "STEP274A Media Core"
   ```
4. Backend neu starten.
5. Routen testen:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/media/status"
   Invoke-RestMethod "http://127.0.0.1:8080/api/media/scan"
   Invoke-RestMethod "http://127.0.0.1:8080/api/media/list?type=audio"
   ```

## Danach

### STEP274B – Medienverwaltung Dashboard

- System → Medien aktivieren.
- Tabs: Audio, Video, Bilder, Animationen.
- Upload per UI.
- Vorschau per Browser-Player.
- Icons statt Textbuttons, wo sinnvoll.
- Bestehende Medien anzeigen und filtern.

### STEP274C – Commands an Medien anbinden

- Sound-Action bekommt Dropdown aus `media_assets`.
- Video-Action bekommt Dropdown aus `media_assets`.
- Vorschau-Icons im Command-Formular.

### STEP274D – Medien-Ausführung

- Sound über vorhandenes Sound-System abspielen.
- Video über Overlay-/Player-System ausführen.
