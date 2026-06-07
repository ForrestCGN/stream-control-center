# CURRENT CHAT HANDOFF - BIRTHDAY PARTY IMAGE HIDE TEXT CARD

STEP: `STEP_BIRTHDAY_PARTY_IMAGE_HIDE_TEXT_CARD`

## Stand

Für die Tadesso-Party sind Bild und Song bereits korrekt als Media-ID gespeichert:

- `imageFile: mediaid:1476`
- `songFile: mediaid:1474`

Das Bild wurde sichtbar, aber die zusätzliche Textkarte verdeckte wichtige Teile des fertigen Birthday-Banners.

## Umsetzung

Nur `htdocs/overlays/_overlay-birthday.html` wurde geändert.

Bei `.stage.has-party-image` wird `.content` ausgeblendet. Der Avatar bleibt sichtbar.

## Nach dem Entpacken

```powershell
.\stepdone.cmd "STEP_BIRTHDAY_PARTY_IMAGE_HIDE_TEXT_CARD"
```

Danach Overlay/Browserquelle neu laden und Tadesso-Party erneut starten.

## Nicht geändert

- Kein Backend
- Kein Dashboard
- Kein Media-System
- Kein Sound-System
- Keine DB
- Keine Party-Daten
