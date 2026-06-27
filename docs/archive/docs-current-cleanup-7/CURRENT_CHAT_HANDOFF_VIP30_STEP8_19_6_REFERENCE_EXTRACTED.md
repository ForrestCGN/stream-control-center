# VIP30 STEP8.19.6 – Reference Extracted Preview

## Ziel
Die VIP30-Vorschau nutzt jetzt den VIP30-CSS-Referenzblock direkt aus der hochgeladenen `sound_system_overlay.html`.

## Wichtig
Diese Datei ist weiterhin nur ein Test/Preview-Prototyp. Es wurden keine produktiven Dashboard-/Overlay-/Backend-Dateien geändert.

## Dateien
- `htdocs/overlays/_test-vip30-editor-preview-reference-extracted.html`
- `docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_6_REFERENCE_EXTRACTED.md`

## Änderungen
- VIP30-Design aus `sound_system_overlay.html` extrahiert.
- Große 840×310 Split-Lounge-Card.
- Keine Mini-Card.
- Simple Textstruktur:
  - Username separat
  - Headline 1
  - Subline
  - optionale Message
- `namePosition: top/bottom` weiterhin testbar.
- Chips/Line in der Preview ausgeblendet, aber die Card-Basis bleibt aus der Referenz.

## Test
1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. Im Browser öffnen:
   `http://127.0.0.1:8080/overlays/_test-vip30-editor-preview-reference-extracted.html`
3. Testnamen/Textsets prüfen.
4. Danach:
   `./stepdone.cmd "VIP30 STEP8.19.6 Reference Extracted Preview erstellt"`
