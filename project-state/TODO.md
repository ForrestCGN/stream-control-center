# TODO – Shot-Alarm

Stand: 2026-06-18

## Offen

- Live-Test mit echten Twitch-Support-Events.
- Prüfen, ob `twitch.subgift.received` bei Bomben zuverlässig `total >= 5` liefert.
- Echte Shot-Sounds einrichten.
- 100er-Bomben-Darstellung final entscheiden: eine Karte mit „10 Shots“ oder Queue mit 10 Einzel-Auslösungen.
- Ko-fi/Tipeee sauber produktiv anbinden.
- Optional DB-History ergänzen.
- Optional Textvarianten für Overlay-Gründe dashboardfähig machen.

## Erledigt in STEP 1

- Neues Modul `shot_alarm` angelegt.
- Twitch-Events via Communication Bus konsumiert.
- Sub/Resub-Puffer eingebaut.
- Finale Default-Regeln umgesetzt, Payment-Regel korrigiert: Einzel-Zähler 20/50/100, Bomben 5er/10er, Bits-Blocklogik je 1000/je 10000, Payment je 10 EUR mit 50/50 Chance.
- Dashboard und Overlay ergänzt.
