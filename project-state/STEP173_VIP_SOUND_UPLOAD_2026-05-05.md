# STEP173 - VIP Sound Upload

Stand: 2026-05-05

## Zweck

VIP-/Mod-Sounds sollen im Dashboard verwaltet werden koennen.

## Umfang

Betroffene Dateien:

- `backend/modules/vip_sound_overlay.js`
- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

## Backend

Neue VIP-Sound-Routen unter `/api/vip-sound` und `/api/vip-sound-overlay`:

- `GET /sounds/users`
- `GET /sounds/status?login=<login>`
- `GET /sounds/resolve?login=<login>`
- `POST /sounds/upload`
- `GET /upload/status`

Upload-Logik:

- `multipart/form-data`
- Feld `file`: Sounddatei
- Feld `login`: Zieluser
- Feld `overwrite`: `true`/`false`
- erlaubte Audio-Endungen kommen aus `helper_media.DEFAULT_ALLOWED_EXTENSIONS`
- Dateigroesse kommt aus DB-Setting `maxSoundUploadBytes`
- Zielordner kommt aus DB-Setting `soundBaseDir`
- Dateiname wird ueber vorhandene VIP-Dateinamenlogik gebaut
- Upload ersetzt vorhandene Datei nur mit `overwrite=true`
- Dauer wird per `helper_media.readAudioDurationMs()` gelesen

Neues DB-Setting/Default:

- `maxSoundUploadBytes = 15728640`

Kein neuer DB-Table in diesem STEP.

## Dashboard

Neuer Tab:

- `Sounds`

Funktionen:

- lokale bekannte VIP-/Mod-/User-Liste aus DB anzeigen
- Soundstatus fuer ausgewaehlten User anzeigen
- manuelle Login-Eingabe
- Datei hochladen
- vorhandenen Song nur mit Checkbox ersetzen

## Bewusst offen

- Twitch VIP-/Mod-Sync folgt spaeter als eigener STEP.
- Kein Transcoding. Die hochgeladene Dateiendung muss aktuell zur VIP-Setting-Dateiendung passen.
- Kein generischer Upload-Helper in diesem STEP, aber der Code ist so gebaut, dass er spaeter extrahiert werden kann.

## Tests

Vor Commit ausfuehren:

```powershell
cd D:\Git\stream-control-center
node -c .\backend\modules\vip_sound_overlay.js
node -c .\htdocs\dashboard\modules\vip.js
```

Live-Tests nach Deploy:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/upload/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/sounds/users" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/sounds/status?login=araglor" | ConvertTo-Json -Depth 20
```

Dashboard:

- Community -> VIP-System -> Sounds
- User auswaehlen oder Login eingeben
- Soundstatus pruefen
- MP3 hochladen
- ohne Replace-Haken darf vorhandene Datei nicht ueberschrieben werden
- mit Replace-Haken darf vorhandene Datei ersetzt werden
