# Birthday Party Image Layout Compact Fix

STEP: `STEP_BIRTHDAY_PARTY_IMAGE_LAYOUT_COMPACT_FIX`

## Ziel

Das Birthday-Overlay soll Party-/Celebration-Bilder kompakter anzeigen. Bei 1920x1080 darf die Einblendung mit Party-Bild maximal ca. zwei Drittel der Breite und Höhe nutzen. Bei 16:9-Bildern wird ein 1280x720-Bereich verwendet.

## Geänderte Datei

- `htdocs/overlays/_overlay-birthday.html`

## Änderung

- Party-Bild-Bereich von nahezu Fullscreen auf zentriertes 1280x720-Hero-Layout reduziert.
- Maximale Größe: `max-width: 66.666%`, `max-height: 66.666%`.
- Shell/Karte nutzt denselben kompakten 16:9-Bereich.
- Textbox wurde verkleinert und unten rechts positioniert.
- Avatar wurde verkleinert und oben links im kompakten Bildbereich positioniert.
- `contain` und `cover` bleiben unterstützt.

## Nicht geändert

- Kein Backend.
- Kein Dashboard.
- Kein Media-System.
- Kein Sound-System.
- Keine DB.
- Keine bestehenden Party-/User-Daten.
- Keine Media-ID-Logik.

## Test

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Node/Server neu starten oder Overlay-Browserquelle aktualisieren.
3. Birthday-Dashboard öffnen.
4. Tadesso Party starten.
5. Prüfen: Party-Bild ist kompakt, zentriert und nutzt maximal ca. 2/3 von Breite/Höhe.

## Stepdone

```powershell
.\stepdone.cmd "STEP_BIRTHDAY_PARTY_IMAGE_LAYOUT_COMPACT_FIX"
```
