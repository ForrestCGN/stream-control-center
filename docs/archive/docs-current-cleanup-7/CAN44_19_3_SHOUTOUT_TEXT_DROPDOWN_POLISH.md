# CAN-44.19.3 – Shoutout Text Dropdown Polish

## Ziel

Kleiner Feinschliff fuer den gemeinsamen Shoutout-Texte-Tab nach dem Dropdown-Layout.

## Änderungen

- Header-Text auf korrekte Schreibweise „offiziellen Twitch-Shoutout“ normalisiert.
- Kategorieanzeige im Editor von Code-Optik auf einen stabilen Badge/Pill umgestellt.
- Entfernen-Button wird bei nur einer Variante nicht mehr angezeigt.
- Entfernen der letzten Variante wird im Event-Handler nicht mehr ausgefuehrt.
- Kleine CSS-Anpassung fuer einzeilige Kategorieanzeige und einspaltige Einzelvariante.

## Nicht geändert

- Keine Backend-Aenderung.
- Keine Datenbank-Aenderung.
- Keine Runtime-Umstellung auf neue Textkeys.
- Keine grosse Dashboard-Neuorganisation.

## Test

```powershell
node -c htdocs\dashboard\modules\shoutout_texts.js
```
