# NEXT_STEPS – Birthday-System

## Sofort nach STEP_BIRTHDAY_004A

1. Backend neu starten/deployen.
2. Status prüfen:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
   Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/show/state"
   ```
3. Dashboard prüfen:
   ```text
   http://127.0.0.1:8080/dashboard
   Community → Birthday-System → Party-Show
   ```
4. Uploads im Dashboard testen:
   - globales Intro-Video
   - Standardsong
   - optional User-Song, z. B. `araglor`
5. Sound-System-Overlay muss in OBS aktiv sein, weil Video/Song darüber laufen.
6. Birthday-Overlay testen:
   ```text
   http://127.0.0.1:8080/overlays/_overlay-birthday.html?debug=1
   ```
7. Test-Command:
   ```powershell
   Invoke-RestMethod "http://127.0.0.1:8080/api/commands/execute" -Method POST -ContentType "application/json" -Body '{"message":"!birthday party testuser","userLogin":"forrestcgn","displayName":"ForrestCGN"}'
   ```
8. Erwartung:
   - Intro-Video läuft über Sound-System.
   - Birthday-Overlay bleibt ruhig.
   - Nach Intro startet Song.
   - Erst dann eskaliert das Birthday-Overlay.
   - Overlay bleibt bis Songende sichtbar.
9. Wenn bestätigt:
   ```powershell
   .\stepdone.cmd "STEP_BIRTHDAY_004A Birthday Show Sound-System"
   ```

## Danach sinnvoll

### STEP_BIRTHDAY_004C – Show Polish
- Dashboard-Testbutton für einzelne User.
- bessere Statusanzeige für Sound-System-Playback.
- optional echte Sound-System-Bundle-Events auswerten statt Dauer-Timer.
- Overlay-Design weiter im CGN-Stil verfeinern.


## STEP_BIRTHDAY_004C

- Birthday-Show Asset-/Dauerstatus ergänzt.
- Dashboard zeigt erkannte Laufzeiten, Fallback-Warnungen, Sound-System-Status und SoundPegel-Status.
- Neue Routen: `/api/birthday/admin/show/assets` und `/api/birthday/admin/show/recheck`.
