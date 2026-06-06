# VIP30 STEP8.19.14 – Descender Fix

## Ziel
Unterlängen in der Headline dürfen nicht mehr abgeschnitten werden. Betroffen sind Zeichen wie `g`, `j`, `p`, `q`, `y`.

## Änderung
Nur CSS-Feinkorrektur der Headline:
- `line-height` von `1.02` auf `1.10`
- `max-height` von `70px` auf `76px`
- `margin-top` von `-1px` auf `0`
- `padding-bottom: 3px` ergänzt

## Unverändert
- Referenz-Card
- Textgrößen: Username 38px, Headline 34px, Subline 20px, Message 16px
- Headline-Fit-Logik aus STEP8.19.13
- Dashboard/Backend/produktives Overlay

## Dateien
- `htdocs/overlays/_test-vip30-editor-preview-reference-extracted-v9.html`
- `docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_14_DESCENDER_FIX.md`

## Test
1. ZIP nach `D:\Git\stream-control-center` entpacken
2. Öffnen:
   `http://127.0.0.1:8080/overlays/_test-vip30-editor-preview-reference-extracted-v9.html`
3. Mit Texten wie `hat sich 30 Tage VIP gegönnt`, `gegönnt`, `VIP gegönnt`, `jumpy glyph` testen
4. Danach:
   `./stepdone.cmd "VIP30 STEP8.19.14 Descender Fix erstellt"`
