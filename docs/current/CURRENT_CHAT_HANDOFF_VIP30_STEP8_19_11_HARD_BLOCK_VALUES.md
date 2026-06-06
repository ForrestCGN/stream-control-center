# VIP30 STEP8.19.11 – Hard Block Values

## Ziel
Klar sichtbare harte Block-Version für den oberen Textblock.

## Änderungen
- Username/Headline als enger Hauptblock aufgebaut
- Username 38px
- Headline 34px, eng am Usernamen
- Headline darf bei Bedarf automatisch bis 28px kleiner werden, um in 2 Zeilen zu bleiben
- Subline 22px
- Message 18px
- Abstand Headline → Subline 18px
- Abstand Subline → Message 12px
- sonstige Referenz-Card unverändert

## Dateien
- `htdocs/overlays/_test-vip30-editor-preview-reference-extracted-v6.html`
- `docs/current/CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_11_HARD_BLOCK_VALUES.md`

## Test
1. ZIP nach `D:\Git\stream-control-center` entpacken
2. Datei öffnen:
   `http://127.0.0.1:8080/overlays/_test-vip30-editor-preview-reference-extracted-v6.html`
3. Textsets/Testnamen prüfen
4. Danach:
   `./stepdone.cmd "VIP30 STEP8.19.11 Hard Block Values erstellt"`
