# Loyalty Games – STEP222 / LWG-6.3

Aktueller Stand nach STEP222:

- `loyalty_games.js` Version `0.2.4`
- Build `STEP_LWG_6_3_GAMBLE_TEXT_PERCENT_PARSER_CLEANUP`
- `!gamble` nutzt neue v2-Textkeys für Gewinn/Verlust/Fehler
- Prozent-Einsätze werden im Parser unterstützt:
  - `!gamble 10%`
  - `!gamble 10 %`
  - `!gamble 10 prozent`
  - optional `half` / `halb`

StreamElements darf während der Migration parallel bleiben.
