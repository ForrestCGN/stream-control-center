# STEP_BIRTHDAY_PARTY_IMAGE_MEDIA_FIELD

Stand: 2026-06-07
Modul: birthday
Ziel: Party-/Celebration-Bild über das bestehende Media-System an UserPartys hängen und im Birthday-Overlay anzeigen.

## Anlass

Beim Test der Tadesso-Party funktionierte das Anlegen/Zuweisen grundsätzlich. Der Sound-Pfad-Fehler wurde separat mit Media-ID-Fix adressiert. Danach sollte zusätzlich ein vorhandenes Geburtstagsbild als visuelles Party-/Celebration-Bild eingebunden werden.

Wichtig: Das bestehende Media-System unterstützt bereits Grafiken/Bilder. Deshalb wurde kein eigenes Upload-System gebaut, sondern der vorhandene MediaField/MediaPicker-Flow genutzt.

## Geänderte Dateien

- `backend/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`
- `htdocs/overlays/_overlay-birthday.html`

## Backend

### Version / Schema

- `MODULE_VERSION`: `0.6.1` -> `0.6.2`
- `SCHEMA_VERSION`: `7` -> `8`

### Neue DB-Felder

Sanfte Migration per `ALTER TABLE`, ohne Datenverlust:

- `birthday_parties.image_file TEXT NOT NULL DEFAULT ''`
- `birthday_parties.image_mode TEXT NOT NULL DEFAULT 'contain'`
- `birthday_show_queue.party_image_file TEXT NOT NULL DEFAULT ''`

### Neue Runtime-Felder

Der Birthday-Show-State kann nun zusätzlich enthalten:

- `partyImageFile`
- `partyImageUrl`
- `partyImageMode`

### Media-ID-Unterstützung

Party-Bilder können als `mediaid:<id>` gespeichert werden. Die URL wird über die vorhandene `media_assets`-Tabelle aufgelöst. Legacy-relative Asset-Pfade bleiben lesbar.

## Dashboard

Im Tab `Partys` wurde beim Party-Formular ergänzt:

- `Party-Bild / Celebration-Bild`
- MediaField mit `data-allowed-types="image"`
- `Bildmodus`: `contain` oder `cover`

Der Wert wird wie beim Song bevorzugt als `mediaid:<id>` gespeichert, wenn das Media-System eine ID liefert.

## Overlay

`_overlay-birthday.html` zeigt bei vorhandenem `partyImageUrl` ein großes Party-Bild im Birthday-Overlay an.

- `contain`: ganzes Bild sichtbar, kein Zuschneiden
- `cover`: Fläche füllen, Zuschneiden möglich

Das bisherige Avatar-/Textlayout bleibt als Fallback erhalten, wenn kein Party-Bild gesetzt ist.

## Nicht geändert

- Kein Sound-System-Umbau
- Kein Media-System-Umbau
- Keine bestehenden Partys gelöscht
- Keine bestehenden Songs geändert
- Keine automatische Geburtstagsshow bei Chat-Aktivität
- Keine produktiven Daten automatisch bereinigt

## Tests

```powershell
node -c backend\modules\birthday.js
node -c htdocs\dashboard\modules\birthday.js
```

Nach Deploy/Restart:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,version,initialized,schemaOk,routeCount

$p = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/admin/show/parties"
$p.parties | Where-Object partyKey -eq "tadesso_party" | Select-Object partyKey,title,imageFile,imageMode,imageUrl,songFile | Format-List
```

Erwartung nach Bildauswahl im Dashboard:

```text
imageFile : mediaid:<id>
imageUrl  : /assets/...
```

Danach im Dashboard:

1. Birthday -> Partys
2. Tadesso Party bearbeiten
3. Party-Bild über MediaField auswählen/hochladen
4. Bildmodus `contain` lassen
5. Party speichern
6. User Tadesso zuordnen bzw. Zuordnung bestehen lassen
7. Speichern & abspielen

## Stepdone

```powershell
.\stepdone.cmd "STEP_BIRTHDAY_PARTY_IMAGE_MEDIA_FIELD"
```
