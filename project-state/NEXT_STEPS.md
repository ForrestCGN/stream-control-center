# NEXT_STEPS – Command-System / Medienverwaltung

## Sofort, wenn weitergearbeitet wird

1. Prüfen, ob STEP273C2 angewendet wurde:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/commands/catalog"
   ```
   Erwartung: Kategorien `Hug-System`, `Tagebuch`, `Todo` getrennt sichtbar.

2. Prüfen, ob STEP274B angewendet wurde:
   ```powershell
   Select-String -Path "D:\Git\stream-control-center\htdocs\dashboard\index.html" -Pattern "media.css|media.js|mediaModule"
   Select-String -Path "D:\Git\stream-control-center\htdocs\dashboard\app.js" -Pattern "media:|mediaModule|Medien"
   ```

3. Falls STEP274B noch nicht angewendet:
   ```powershell
   cd D:\Git\stream-control-center
   node tools\easy\STEP274B_APPLY_MEDIA_DASHBOARD.cjs
   node --check htdocs\dashboard\modules\media.js
   node --check tools\easy\STEP274B_APPLY_MEDIA_DASHBOARD.cjs
   .\stepdone.cmd "STEP274B Media Dashboard"
   ```

4. Nach Deploy/Restart testen:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/media/status"
   Invoke-RestMethod "http://127.0.0.1:8080/api/media/list?type=audio"
   Invoke-RestMethod "http://127.0.0.1:8080/api/media/list?type=video"
   ```

5. Dashboard prüfen:
   ```text
   http://127.0.0.1:8080/dashboard
   System → Medien
   ```

## Danach sinnvoll

### STEP274B1 – Media Dashboard Fixes/Polish
Nur falls beim Test UI-Probleme auftauchen.

Mögliche Punkte:
- Vorschau-Player verbessern.
- Listen filtern/sortieren.
- Kaputte Medien sichtbar markieren.
- Soft-Delete/Hard-Delete UX absichern.
- Scan-Ergebnis übersichtlicher darstellen.

### STEP274C – Commands an Medienverwaltung anbinden
- Command Action-Typ `sound_play` bekommt Dropdown aus `/api/media/list?type=audio`.
- Command Action-Typ `video_play` bekommt Dropdown aus `/api/media/list?type=video`.
- Vorschau-Icons im Command-Formular.
- Noch keine neue Medienverwaltung im Command selbst bauen.

### STEP274D – Medien-Ausführung
- Sound-Actions über bestehendes Sound-System abspielen.
- Video-Actions über Overlay-/Player-System anzeigen.
- Queue/Priorität/Lautstärke/Target sauber konfigurieren.

### STEP275 – Textgruppen/Zufallstexte
- Zentrale Textgruppen für Commands.
- Zufällige Varianten.
- Dashboardfähige Bearbeitung.
- Nicht im Command-Formular verstecken.
