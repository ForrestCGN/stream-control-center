# STEP LC-TAB-1 – Loyalty Core als Tab im Loyalty-Control-Center

## Ziel
Der bestehende Loyalty-Bereich bleibt die gemeinsame Oberfläche für alle Loyalty-Module.
Der Kekskrümel-Core wird als eigener Tab in die vorhandene Loyalty-Tab-Leiste aufgenommen.

## Geänderte Dateien
- `dashboard/modules/loyalty_games.js`
- `dashboard/modules/loyalty.js`

## Änderungen
- In `loyalty_games.js` wurde der Tab `Core` zwischen `Übersicht` und `Glücksrad` eingefügt.
- Die Modulkarte `Loyalty Core` in der Übersicht öffnet nun das vorhandene Core-Modul `loyalty` statt nur auf die Übersicht zu springen.
- In `loyalty.js` wurde oben eine gemeinsame Loyalty-Tab-Leiste ergänzt, damit der Core als Teil des Loyalty-Control-Centers wirkt.
- Die Core-Tab-Leiste verlinkt zurück auf Übersicht, Glücksrad, Presets, Giveaways, Gamble, Config, Chat/Commands, Verlauf und Hinweise.

## Nicht geändert
- Kein Backend geändert.
- Keine Datenbank geändert.
- Kein Shadow/Live-Wechsel.
- Keine Commands aktiviert/deaktiviert.
- Keine Punkte-Migration.
- Keine Games-/Giveaway-Funktionalität entfernt.

## Test
1. ZIP nach `D:\Streaming\stramAssets\` entpacken und vorhandene Dateien überschreiben.
2. Dashboard hart neu laden: `STRG + F5`.
3. Links auf `Loyalty` klicken.
4. In der Tab-Leiste muss `Core` zwischen `Übersicht` und `Glücksrad` sichtbar sein.
5. Klick auf `Core` öffnet den Kekskrümel-Core.
6. Im Core bleibt oben die gemeinsame Loyalty-Tab-Leiste sichtbar.
7. Wechsel zurück zu `Übersicht`, `Glücksrad`, `Presets`, `Gamble` usw. muss funktionieren.
8. Giveaways öffnet weiter das Giveaway-Control-Modul.

## StepDone
`StepDone: LC-TAB-1 Loyalty Core als Tab im Loyalty-Control-Center`
