# Current Chat Handoff - Birthday Party Image Layout Compact Fix

STEP: `STEP_BIRTHDAY_PARTY_IMAGE_LAYOUT_COMPACT_FIX`

## Ausgangslage

Tadesso Party speichert Bild und Song korrekt als Media-ID:

- `partyImageFile: mediaid:1476`
- `songFile: mediaid:1474`

Das Problem lag nicht mehr an Media-ID, sondern am Overlay-Layout: Das Party-Bild wurde in einer fast fullscreen-großen Fläche angezeigt und erzeugte zu viel leeren violetten Raum.

## Umsetzung

Geändert wurde nur:

- `htdocs/overlays/_overlay-birthday.html`

Das Party-Bild-Layout wurde auf einen kompakten 16:9-Hero-Bereich begrenzt:

- Breite: 1280px, maximal 66.666% der Stage
- Höhe: 720px, maximal 66.666% der Stage
- Textkarte unten rechts
- Avatar kompakt oben links

## Nicht geändert

- Backend
- Dashboard
- Media-System
- Sound-System
- DB
- Media-ID-Speicherung

## Nach dem Entpacken

```powershell
.\stepdone.cmd "STEP_BIRTHDAY_PARTY_IMAGE_LAYOUT_COMPACT_FIX"
```

Danach Browserquelle/Node neu laden und Tadesso Party erneut starten.
