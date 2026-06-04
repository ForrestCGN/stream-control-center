# CAN-44.19.1 README

Dieser STEP verbessert nur die Oberfläche des gemeinsamen Shoutout-Texte-Tabs.

## Einspielen

```powershell
cd D:\Git\stream-control-center
# ZIP nach D:\Git\stream-control-center entpacken
node -c htdocs\dashboard\modules\shoutout_texts.js
.\stepdone.cmd "CAN-44.19.1 Shoutout Text UI Cleanup"
```

## Prüfen

1. Dashboard öffnen.
2. Shoutout-System öffnen.
3. Tab `Texte` öffnen.
4. Kategorien, Key-Liste, Editor und Migration/Kompatibilität prüfen.

## Rollback

Die Dateien aus CAN-44.19 wieder einspielen.
