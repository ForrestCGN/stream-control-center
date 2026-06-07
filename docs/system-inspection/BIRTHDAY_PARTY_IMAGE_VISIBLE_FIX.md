# Birthday Party Image Visible Fix

Step: STEP_BIRTHDAY_PARTY_IMAGE_VISIBLE_FIX

## Ziel

Das Party-/Celebration-Bild wird im Birthday-Overlay sichtbar angezeigt, wenn `partyImageUrl` vorhanden ist.

## Ursache

Nach dem Compact-Layout lag das Bild außerhalb der eigentlichen `.shell`. Die `.shell` zeichnete ihre halbtransparente violette Panel-Fläche darüber, wodurch das Bild verdeckt wurde.

## Änderung

Betroffene Datei:

- `htdocs/overlays/_overlay-birthday.html`

Änderungen:

- `#partyImage` wurde in die `.shell` verschoben.
- Das Bild liegt nun innerhalb des 16:9-Shell-Containers.
- Das Bild nutzt weiterhin maximal ca. 2/3 der Overlay-Breite und -Höhe über die Shell-Größe `1280x720` bei 1920x1080.
- `contain` und `cover` bleiben erhalten.
- Avatar und Textkarte bleiben über dem Bild.

## Nicht geändert

- Kein Backend
- Kein Dashboard
- Kein Media-System
- Kein Sound-System
- Keine DB
- Keine Media-ID-Logik
- Keine Party-Daten

## Test

1. Dateien nach `D:\Git\stream-control-center` entpacken.
2. Browserquelle/Overlay neu laden.
3. Birthday-Show starten, z. B. Tadesso Party.
4. Erwartung: Das Party-Bild ist im kompakten 16:9-Bereich sichtbar; Textkarte und Avatar liegen darüber.

## Stepdone

```powershell
.\stepdone.cmd "STEP_BIRTHDAY_PARTY_IMAGE_VISIBLE_FIX"
```
