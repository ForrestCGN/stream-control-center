# CAN-44.19.2 – Shoutout Text Dropdown Layout

Stand: 2026-06-04

## Ziel

Der gemeinsame Shoutout-Texte-Tab wurde vom bisherigen Listen-/Spaltenlayout auf ein kompakteres Dropdown-Layout umgestellt.

Grund: Das vorherige Layout nutzte unterschiedliche Bildschirmbreiten schlecht aus und wirkte bei anderen Auflösungen schnell unausgewogen. Die neue Variante ist bewusster responsiv und verzichtet auf feste breite Navigationslisten im Textbereich.

## Geänderte Dateien

- `htdocs/dashboard/modules/shoutout_texts.js`
- `htdocs/dashboard/modules/shoutout_texts.css`
- `docs/current/CAN44_19_2_SHOUTOUT_TEXT_DROPDOWN_LAYOUT.md`
- `docs/current/CAN44_19_2_README.md`
- `docs/modules/SHOUTOUT_TEXT_DASHBOARD_TAB.md`

## Änderungen

- Kategorie-Auswahl als Dropdown
- Text-Key-Auswahl als Dropdown
- kein linkes Kategorie-/Key-Listenlayout mehr
- Editor direkt darunter
- Varianten als einzelne Textfelder statt einer großen Textarea
- Button `+ Variante`
- Button zum Entfernen einzelner Varianten
- Migration / Kompatibilität bleibt eingeklappt
- Legacy-Kategorie bleibt sichtbar markiert
- Layout ist responsiver und bricht bei kleineren Breiten kontrollierter um

## Nicht geändert

- Keine Backend-Änderung
- Keine Datenbank-Änderung
- Keine Runtime-Umstellung auf `shoutout.*`
- Keine Entfernung alter Legacy-/Fallback-Keys

## Tests

```powershell
node -c htdocs\dashboard\modules\shoutout_texts.js
```

Ergebnis: Syntax OK.

## Nächster Schritt

Nach visuellem Test im Dashboard kann entweder weiter am Texte-Tab nachgebessert oder mit dem größeren Dashboard-Umbau begonnen werden.
