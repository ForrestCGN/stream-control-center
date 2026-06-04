# CAN-44.19.2 – README

## Einspielen

```powershell
cd D:\Git\stream-control-center

# ZIP nach D:\Git\stream-control-center entpacken

node -c htdocs\dashboard\modules\shoutout_texts.js

.\stepdone.cmd "CAN-44.19.2 Shoutout Text Dropdown Layout"
```

## Test im Browser

1. Dashboard öffnen
2. Shoutout-System öffnen
3. Tab `Texte` öffnen
4. Kategorie per Dropdown wählen
5. Text-Key per Dropdown wählen
6. Varianten bearbeiten / hinzufügen / entfernen
7. Speichern testen

## Hinweis

Dieser Step ändert nur das Dashboard-Layout des Textbereichs. Backend, DB und Runtime bleiben unverändert.
