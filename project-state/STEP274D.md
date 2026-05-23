# STEP274D – Central Media Resolver

## Ziel

STEP274D erweitert die zentrale Medienverwaltung um eine einheitliche Resolver-Schicht, damit Backend-Module Medien nicht mehr selbst über Pfade, Web-URLs oder Spezialfälle ableiten müssen.

## Geändert

### Backend

- `backend/modules/media.js`
  - Step auf `STEP274D` angehoben.
  - Neue Resolver-Funktionen ergänzt:
    - `getAsset(ref)`
    - `resolveAssetForUse(ref, options)`
    - `mediaOptionFromAsset(asset, options)`
    - `soundSystemFileFor(asset)`
  - Neue API ergänzt:
    - `GET /api/media/resolve?id=<id>&useCase=<useCase>`
  - Status-Routen und Hinweistext aktualisiert.

- `backend/modules/commands_media.js`
  - Step auf `STEP274D` angehoben.
  - Medienoptionen werden jetzt über `media.mediaOptionFromAsset(...)` aufgebaut, nicht mehr über eigene Pfadlogik.
  - Die Command-Media-Brücke nutzt damit dieselbe zentrale Resolver-Logik wie spätere Module.

### Dashboard

- `htdocs/dashboard/modules/commands_media.js`
  - Hinweistext aktualisiert: Commands bekommen Resolver-Daten aus der zentralen Medienverwaltung.

## Bewusst nicht geändert

- Keine bestehende Command-Ausführung verändert.
- Keine echte Sound-/Video-Ausführung für `sound_play` oder `video_play` eingebaut.
- Keine Medien verschoben, kopiert oder gelöscht.
- Keine Änderung an `sound_system.js`.
- Keine DB-Daten überschrieben.

## Warum keine direkte Ausführung?

`/api/sound/play` erwartet aktuell eine Datei relativ zu `htdocs/assets/sounds`. Neue Uploads aus der Medienverwaltung liegen aber unter `htdocs/assets/media/<type>`. Deshalb muss die Sound-System-Ausführung in einem eigenen Folge-Step sauber media-registry-aware gemacht werden.

## Tests

Syntax:

```powershell
node --check backend/modules/media.js
node --check backend/modules/commands_media.js
node --check htdocs/dashboard/modules/commands_media.js
```

Live/API nach Deploy:

```powershell
Invoke-RestMethod http://127.0.0.1:8080/api/media/status
Invoke-RestMethod "http://127.0.0.1:8080/api/media/resolve?id=325"
Invoke-RestMethod "http://127.0.0.1:8080/api/media/resolve?id=325&useCase=sound_system"
Invoke-RestMethod http://127.0.0.1:8080/api/commands/media-bridge/status
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-options?type=audio&status=active"
```

## Nächster Schritt

STEP274E/STEP274D2: Sound-System gezielt media-registry-aware machen, damit `media/audio/*` und später Video/Animationen aus `media_assets` tatsächlich abgespielt werden können, ohne Legacy-Sound-Pfade zu erzwingen.
