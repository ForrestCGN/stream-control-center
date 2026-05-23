# STEP275A - Sound-System spielt Media-Registry per mediaId

## Ziel

Neue Medien sollen nicht mehr zwingend nach `htdocs/assets/sounds/...` kopiert werden muessen, nur damit das Sound-System sie abspielen kann.

## Umsetzung

`/api/sound/play` und `/api/sound/bundle`-Items koennen jetzt optional `mediaId` / `media_id` enthalten.

Das Sound-System:

1. liest `media_assets` aus der SQLite-Datenbank,
2. prueft, ob die Datei innerhalb von `htdocs/assets` liegt,
3. liest Media-Infos direkt vom absoluten Pfad,
4. setzt Browser-URL auf `/assets/media/...`,
5. nutzt fuer Device-Playback den absoluten Pfad.

## Beispiel

```powershell
Invoke-RestMethod -Uri "http://127.0.0.1:8080/api/sound/play" -Method POST -ContentType "application/json" -Body '{"mediaId":1234,"label":"MediaId Test","category":"test","outputTarget":"overlay","target":"stream","volume":85}'
```

## Wichtig

STEP275A aendert noch nicht automatisch das Birthday-Modul.
Das folgt im naechsten Step, damit Birthday neue Songs nur noch als `mediaId` speichert und keine Kopie nach `assets/sounds/birthday` erzeugt.
