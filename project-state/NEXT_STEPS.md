# NEXT_STEPS

## Nächster sinnvoller Step: STEP276C_ALERT_PLAYBACK_MEDIAID

- Alert-Sound-Bundle soll bevorzugt `rule.sound_media_id` als `mediaId` an das Sound-System übergeben.
- Wenn keine `sound_media_id` gesetzt ist, bleibt der bestehende `file`-Fallback über `sound_url` aktiv.
- Noch kein Löschen alter `alert_assets`.
- Danach erst Dashboard-MediaPicker-Anbindung in STEP276D.

## Tests nach STEP276B

```powershell
node --check backend\modules\alert_system.js
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/alerts/status"
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/alerts/rules"
```

## Spätere Steps

### STEP276D_ALERT_DASHBOARD_MEDIAPICKER

- Alert-Regel-Editor nutzt MediaPicker/MediaField.
- Upload-Ziel: `assets/media/alerts/<category>/`.

### STEP276E_ALERT_MEDIA_DIAGNOSIS

- Nur Diagnose/Migrationsplan.
- Keine automatische Löschung alter Dateien.

## Nach STEP276B_FIX1

- Backend neu starten.
- `/api/alerts/status` prüfen: `schemaVersion` bleibt 6.
- `/api/alerts/rules` prüfen: erste Regel muss die Properties `sound_media_id` und `image_media_id` enthalten.
- Danach STEP276C planen: Alert-Playback bevorzugt per `mediaId`, Legacy-`sound_asset_id`/`sound_url` bleibt Fallback.
