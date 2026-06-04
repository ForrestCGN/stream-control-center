# Shoutout Text Dashboard Tab

Der Shoutout-Texte-Tab ist der gemeinsame Editor für Textvarianten des Shoutout-Systems.

## Dateien

- `htdocs/dashboard/modules/shoutout_texts.js`
- `htdocs/dashboard/modules/shoutout_texts.css`

## Routen

- `GET /api/clip-shoutout/texts`
- `POST /api/clip-shoutout/texts`
- `GET /api/clip-shoutout/texts/migration`

## Kategorien

- `shoutout.chat` – Chat-Shoutout
- `shoutout.auto` – AutoShoutout
- `shoutout.official` – Offizieller Twitch-Shoutout
- `shoutout.system` – Systemmeldungen
- `auto_shoutout` – Legacy/Fallback für ältere AutoShoutout-Texte

## CAN-44.19.1 UI-Cleanup

- Die Textarea ist kompakter und wächst nicht mehr unnötig groß bei wenigen Varianten.
- Legacy-Kategorien und Legacy-Keys werden sichtbar markiert.
- Der Migration-/Kompatibilitätsblock ist einklappbar.
- Backend, Datenbank und Runtime-Verhalten bleiben unverändert.

## Wichtig

Die Runtime verwendet weiterhin bestehende Config-/Legacy-Fallbacks, bis eine spätere bewusste Umstellung auf die neuen `shoutout.*` Keys erfolgt.
