# Project State – LWG_CHAT_OUTPUT_1B

Stand: 2026-06-19

## Bereich

`stream-control-center` / Loyalty-Giveaways / CGN-Glücksrad

## Aktueller Stand

```text
loyalty_giveaways: 0.1.18 / LWG_CHAT_OUTPUT_1B
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Bestätigt

- `LWG_CHAT_COMMANDS_1` ist aktiv.
- `!ticket` läuft über das zentrale Command-System zur Giveaway-Runtime.
- `!wheel` und `!rad` laufen über das zentrale Command-System zur Giveaway-Runtime.
- `!join` und `!raffle` bleiben Raffle.
- Interaktiver Komplett-Test mit 3 Gewinnern und Sperrliste ist fachlich bestanden.
- `LWG_CHAT_OUTPUT_1` sendet grundsätzlich Chatmeldungen für `ticket.*` und `wheel.*`.

## Neu gebaut

`LWG_CHAT_OUTPUT_1B`:

- reduziert Legacy-/DB-Mehrzeiler vor Chat-Ausgabe auf genau eine zufällige Einzelzeile,
- nutzt vorhandene Helper/Textvarianten,
- keine neuen hartcodierten Texte,
- keine DB-Handarbeit,
- keine Änderung an Draw/Wheel/Exclusion/Raffle.

## Test offen

- `!ticket` muss nach Entry-Erstellung genau eine Chat-Bestätigung senden.
- `!wheel`/`!rad` muss nach Wheel-Claim genau eine Chat-Bestätigung senden.
- Keine Doppeltexte/Mehrsatz-Varianten mehr in einer Chatnachricht.
- Testscript 1.3 später sauber mit SUCCESS prüfen.
