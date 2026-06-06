# VIP30 STEP8.19.12 – Headline Scale + Ellipsis

## Ziel
Nächster klarer Feinschliff nach fester Vorgabe.

## Änderungen
- Subline auf 20px gesetzt
- Message auf 16px gesetzt
- Abstand Headline → Subline = 12px
- Abstand Subline → Message = 12px
- Headline skaliert automatisch bis minimum 28px herunter
- Wenn die Headline selbst dann noch nicht passt, wird sie mit `...` gekürzt
- Rest der Referenz-Card unverändert

## Dateien
- `htdocs/overlays/_test-vip30-editor-preview-reference-extracted-v7.html`
- `docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_12_HEADLINE_SCALE_ELLIPSIS.md`

## Test
1. ZIP nach `D:\Git\stream-control-center` entpacken
2. Datei öffnen:
   `http://127.0.0.1:8080/overlays/_test-vip30-editor-preview-reference-extracted-v7.html`
3. Textsets/Testnamen prüfen
4. Danach:
   `./stepdone.cmd "VIP30 STEP8.19.12 Headline Scale + Ellipsis erstellt"`
