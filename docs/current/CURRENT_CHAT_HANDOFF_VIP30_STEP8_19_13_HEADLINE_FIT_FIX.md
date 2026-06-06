# VIP30 STEP8.19.13 – Headline Fit Fix

## Ziel
Die Headline-Fit-Logik reparieren, damit kurze Headlines wie `wird Ehrenbewohner` nicht fälschlich zu früh gekürzt werden.

## Änderungen
- Subline bleibt bei 20px
- Message bleibt bei 16px
- Abstand Headline → Subline = 12px
- Abstand Subline → Message = 12px
- Headline wird jetzt mit einer Offscreen-Messung sauber geprüft
- Headline nutzt bis zu 2 Zeilen
- Headline wird zuerst nur von 34px bis 28px verkleinert
- Erst wenn sie selbst bei 28px noch nicht passt, wird mit `...` gekürzt
- Keine aggressive Früh-Kürzung mehr bei kurzen Headlines

## Dateien
- `htdocs/overlays/_test-vip30-editor-preview-reference-extracted-v8.html`
- `docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_13_HEADLINE_FIT_FIX.md`

## Test
1. ZIP nach `D:\Git\stream-control-center` entpacken
2. Datei öffnen:
   `http://127.0.0.1:8080/overlays/_test-vip30-editor-preview-reference-extracted-v8.html`
3. Headline mit kurzen und langen Texten prüfen
4. Danach:
   `./stepdone.cmd "VIP30 STEP8.19.13 Headline Fit Fix erstellt"`
