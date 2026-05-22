# NEXT_STEPS – Birthday-System

## Sofort nach STEP_BIRTHDAY_004

1. Backend neu starten/deployen.
2. Status prüfen:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
   Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/state"
   ```
3. Dashboard prüfen:
   ```text
   http://127.0.0.1:8080/dashboard
   Community → Birthday-System
   ```
4. Overlay in OBS oder Browser testen:
   ```text
   http://127.0.0.1:8080/overlays/_overlay-birthday.html?debug=1
   ```
5. Standardwerte setzen:
   - `show.defaultVideoUrl`
   - `show.defaultVideoDurationMs`
   - `show.defaultSongFile`
   - `show.defaultSongVolume`
   - optional User-spezifische Song-/Video-Felder
6. Test-Command:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute" -Method POST -ContentType "application/json" -Body '{"message":"!birthday party testuser","userLogin":"forrestcgn","displayName":"ForrestCGN"}'
   ```
7. Wenn bestätigt:
   ```powershell
   .\stepdone.cmd "STEP_BIRTHDAY_004 Birthday Show"
   ```

## Danach sinnvoll

### STEP_BIRTHDAY_004A – Show Polish
- Overlay Design weiter im CGN-Stil verfeinern.
- Dashboard-Testbutton für Show hinzufügen.
- Medienauswahl per Media-Dropdown statt Textfeld.
- Subcommand-Rechte besser über Command-Core erweitern, falls benötigt.

### STEP_BIRTHDAY_005 – Media-/Command-Core Integration
- User-Song und Video über `media_assets` auswählen.
- `!birthday party` Berechtigung sauber über Command-System/Subcommand-Rechte abbilden.
