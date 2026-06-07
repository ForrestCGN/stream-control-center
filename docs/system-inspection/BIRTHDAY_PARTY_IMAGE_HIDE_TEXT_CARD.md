# BIRTHDAY_PARTY_IMAGE_HIDE_TEXT_CARD

STEP: `STEP_BIRTHDAY_PARTY_IMAGE_HIDE_TEXT_CARD`

## Ziel

Für personalisierte Birthday-Party-Bilder wird die zusätzliche Textkarte im Overlay ausgeblendet. Der Avatar bleibt sichtbar.

## Änderung

Datei:

- `htdocs/overlays/_overlay-birthday.html`

Anpassung:

- Bei aktivem Party-Bild (`.stage.has-party-image`) wird `.content` ausgeblendet.
- Das Party-Bild bleibt im kompakten 16:9-Bereich.
- Der Avatar bleibt weiterhin sichtbar.

## Nicht geändert

- Kein Backend
- Kein Dashboard
- Kein Media-System
- Kein Sound-System
- Keine DB
- Keine Media-ID-Logik
- Keine Party-Daten
- Keine automatische Show-Logik

## Test

1. Overlay/Browserquelle neu laden.
2. Birthday-Party mit Party-Bild starten.
3. Erwartung:
   - Party-Bild sichtbar.
   - Avatar sichtbar.
   - Keine Textkarte über dem Bild.
