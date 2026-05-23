# STEP275A - Sound-System MediaId Direct

## Inhalt

- Sound-System kann Media-Registry-Dateien direkt per `mediaId` abspielen.
- Keine Kopie nach `htdocs/assets/sounds/...` notwendig, wenn Modul direkt `mediaId` übergibt.
- Bestehende `file`-Pfadlogik bleibt unverändert erhalten.
- `/api/media/resolve?useCase=sound_system` kann Media-Registry-Assets als direkt kompatibel melden.

## Noch nicht enthalten

Birthday speichert und spielt noch nicht automatisch per `mediaId`. Das ist STEP275B.

## Test

PowerShell:

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/sound/play" -Method POST -ContentType "application/json" -Body '{"mediaId":1234,"label":"MediaId Test","category":"test","outputTarget":"overlay","target":"stream","volume":85}'
```
