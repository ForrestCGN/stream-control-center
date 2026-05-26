# STEP274F – Command sound_play/video_play Media Execution Routing

## Ziel

Commands sollen fuer `sound_play` und `video_play` nicht nur eine Media-ID speichern, sondern beim Speichern direkt eine ausfuehrbare Route bekommen:

`/api/sound/play-media?mediaId=<id>`

Damit laeuft der Weg:

Command -> Media-ID -> Sound-Media-Bridge -> Sound-System Queue

## Geaendert

- `backend/modules/commands_media.js`
  - Step auf STEP274F.
  - `/api/commands/media-options` liefert pro Option `commandRoute`, `commandTargetUrl`, `commandModuleKey`, `commandActionKey`.
  - Status beschreibt die execute-ready Verbindung.
- `htdocs/dashboard/modules/commands_media.js`
  - nutzt `commandTargetUrl` aus den Media-Optionen.
  - setzt beim Auswaehlen eines Mediums automatisch:
    - `moduleKey = sound_media_bridge`
    - `actionKey = play_audio_media` oder `play_video_media`
    - `targetMethod = POST`
    - `targetUrl = /api/sound/play-media?mediaId=<id>`
    - `responseMode = module`
- `htdocs/dashboard/modules/commands_media.css`
  - bleibt kompatibel fuer Route-Hinweise.

## Nicht geaendert

- Keine bestehende Command-Ausfuehrung entfernt.
- Kein Umbau an `backend/modules/commands.js`.
- Kein Umbau am Sound-System-Core.
- Keine Medien werden verschoben oder geloescht.
- SQLite wird nicht ersetzt.

## Test

```powershell
node --check backend\modules\commands_media.js
node --check htdocs\dashboard\modules\commands_media.js
Invoke-RestMethod http://127.0.0.1:8080/api/commands/media-bridge/status
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-options?type=audio&status=active"
```

Dashboard:

1. Commands oeffnen.
2. Command mit Action-Typ `MP3 / Sound abspielen` erstellen/bearbeiten.
3. Medium auswaehlen.
4. Unter Erweitert pruefen:
   - Modul: `sound_media_bridge`
   - Ziel-URL: `/api/sound/play-media?mediaId=<id>`
5. Speichern.
6. Diagnose/Execute oder Chat-Command testen.

## Naechster Step

STEP274G: Video/Animation-Flow sauber pruefen und ggf. Overlay-/Video-spezifische Optionen erweitern.
