# STEP274C – Commands ↔ Medienverwaltung anbunden

## Ziel
Commands sollen bei den vorbereiteten Action-Typen `sound_play` und `video_play` Medien direkt aus der zentralen Medienverwaltung auswählen können.

## Geändert
- Neues Backend-Modul `backend/modules/commands_media.js` ergänzt.
- Neue API:
  - `GET /api/commands/media-options`
  - `GET /api/commands/media-bridge/status`
- Neues Dashboard-Brückenmodul `htdocs/dashboard/modules/commands_media.js` ergänzt.
- Neues CSS `htdocs/dashboard/modules/commands_media.css` ergänzt.
- Dashboard `htdocs/dashboard/index.html` lädt die neue Command-Media-Brücke nach `commands.js`.

## Verhalten
- Die bestehende Command-Ausführung wird nicht verändert.
- Bestehende Commands bleiben unverändert.
- Sound-/Video-Action-Felder im Command-Editor nutzen jetzt Dropdowns aus `media_assets` statt reine Freitext-Medium-ID-Felder.
- Gespeichert wird weiterhin im vorhandenen `config_json` des Commands.
- Keine Medien werden verschoben, gelöscht oder automatisch abgespielt.

## Bewusst nicht geändert
- Keine Änderung an `backend/modules/commands.js`.
- Keine Änderung am Sound-System.
- Keine Änderung an der tatsächlichen Ausführung von `sound_play`/`video_play`.
- Keine DB-Migration nötig.

## Tests
- `node --check backend/modules/commands_media.js`
- `node --check htdocs/dashboard/modules/commands_media.js`
- API prüfen:
  - `Invoke-RestMethod http://127.0.0.1:8080/api/commands/media-bridge/status`
  - `Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-options?type=audio&status=active"`
  - `Invoke-RestMethod "http://127.0.0.1:8080/api/commands/media-options?type=video,animation&status=active"`

## Nächster Schritt
STEP274D: tatsächliche Command-Ausführung für Medienaktionen sauber anbinden. Dabei muss vorab geprüft werden, ob `sound_system` Medien aus `htdocs/assets/media/*` direkt abspielen soll oder ob eine zentrale Resolver-Schicht benötigt wird.
