# Current Chat Handoff - Birthday Party Image Visible Fix

Step: STEP_BIRTHDAY_PARTY_IMAGE_VISIBLE_FIX

## Kontext

Beim Test der Tadesso Party waren `imageFile` und `songFile` korrekt als Media-ID gespeichert:

- `partyImageFile: mediaid:1476`
- `partyImageUrl: /assets/media/birthday/default-song/Geburstag_Tadesso.png`
- `songFile: mediaid:1474`

Trotzdem war das Bild im Overlay nicht sichtbar. Sichtbar war nur die violette Panel-Fläche mit Avatar und Textkarte.

## Ergebnis

Das Overlay wurde so angepasst, dass `#partyImage` innerhalb der `.shell` liegt. Dadurch wird das Bild nicht mehr von der Shell-Fläche verdeckt.

## Geänderte Datei

- `htdocs/overlays/_overlay-birthday.html`

## Nicht geändert

- Backend
- Dashboard
- Media-System
- Sound-System
- DB
- Media-ID-Logik

## Nächster Test

Nach Entpacken und Stepdone:

```powershell
.\stepdone.cmd "STEP_BIRTHDAY_PARTY_IMAGE_VISIBLE_FIX"
```

Dann Overlay/Browserquelle neu laden und Tadesso Party erneut starten.
