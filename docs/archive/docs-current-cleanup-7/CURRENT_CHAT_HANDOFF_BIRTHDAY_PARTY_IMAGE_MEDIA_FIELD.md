# CURRENT CHAT HANDOFF - STEP_BIRTHDAY_PARTY_IMAGE_MEDIA_FIELD

## Kurzstand

Es wurde ein kurzfristiger Birthday-Step gebaut, damit UserPartys zusätzlich ein grafisches Party-/Celebration-Bild aus dem bestehenden Media-System nutzen können.

## Ausgangslage

- Tadesso Party konnte angelegt und Tadesso zugeordnet werden.
- Der vorherige Fehler lag beim Songpfad (`media/...` statt `mediaid:<id>` bzw. gültigem Soundpfad).
- Danach sollte ein vorhandenes Tadesso-Geburtstagsbild in die Party eingebunden werden.
- Das Media-System unterstützt bereits Grafiken; deshalb wurde kein neues Upload-System gebaut.

## Enthaltene Dateien

- `backend/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.js`
- `htdocs/dashboard/modules/birthday.css`
- `htdocs/overlays/_overlay-birthday.html`
- `docs/system-inspection/BIRTHDAY_PARTY_IMAGE_MEDIA_FIELD.md`
- `docs/current/CURRENT_CHAT_HANDOFF_BIRTHDAY_PARTY_IMAGE_MEDIA_FIELD.md`

## Technischer Stand

Backend:

- Birthday Modulversion auf `0.6.2`
- Schema-Version auf `8`
- Neue Felder für Party-Bild:
  - `birthday_parties.image_file`
  - `birthday_parties.image_mode`
  - `birthday_show_queue.party_image_file`
- Show-State enthält `partyImageFile`, `partyImageUrl`, `partyImageMode`.

Dashboard:

- Im Tab `Partys` gibt es jetzt `Party-Bild / Celebration-Bild`.
- MediaField nutzt `data-allowed-types="image"` und speichert bevorzugt `mediaid:<id>`.
- Bildmodus kann `contain` oder `cover` sein.

Overlay:

- Wenn `partyImageUrl` vorhanden ist, wird das Bild groß im Overlay angezeigt.
- Ohne Bild bleibt das bisherige Standardlayout aktiv.

## Tests nach Entpacken

```powershell
node -c backend\modules\birthday.js
node -c htdocs\dashboard\modules\birthday.js
```

Dann Node neu starten und prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
$s | Select-Object ok,module,moduleVersion,moduleBuild,version,initialized,schemaOk,routeCount
```

Danach im Dashboard die Tadesso Party öffnen, Bild per MediaField auswählen/hochladen, speichern und abspielen.

## Stepdone

```powershell
.\stepdone.cmd "STEP_BIRTHDAY_PARTY_IMAGE_MEDIA_FIELD"
```

## Nächster sinnvoller Schritt

Falls das Bild angezeigt wird, danach den eigentlichen Show-Builder sauber ausbauen:

- Felder für User-Show vollständig definieren
- eigener `POST /api/birthday/show/start`
- bessere Validierung im Dashboard für Song/Bild (`mediaid` sichtbar prüfen)
- Preview-Status für fehlende Datei / falschen Media-Typ
