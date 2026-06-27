# CAN-44.19.3 README

## Einspielen

```powershell
cd D:\Git\stream-control-center
# ZIP nach D:\Git\stream-control-center entpacken
node -c htdocs\dashboard\modules\shoutout_texts.js
.\stepdone.cmd "CAN-44.19.3 Shoutout Text Dropdown Polish"
```

## Kontrolle

Dashboard oeffnen, Shoutout-System -> Texte.

Pruefen:

- Header schreibt „offiziellen Twitch-Shoutout“.
- Kategorie im Editor bricht nicht mehr unschoen um.
- Bei nur einer Variante wird kein Entfernen-X angezeigt.
