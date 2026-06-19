# Project State – LWG_CHAT_OUTPUT_1

Stand: 2026-06-19

## Bereich

`stream-control-center` / Loyalty-Giveaways / CGN-Glücksrad

## Aktueller Stand

```text
loyalty_giveaways: 0.1.17 / LWG_CHAT_OUTPUT_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Bestätigt

- `LWG_CHAT_COMMANDS_1` ist aktiv.
- `!ticket` läuft über das zentrale Command-System zur Giveaway-Runtime.
- `!wheel` und `!rad` laufen über das zentrale Command-System zur Giveaway-Runtime.
- `!join` und `!raffle` bleiben Raffle.
- Interaktiver Komplett-Test mit 3 Gewinnern und Sperrliste ist fachlich bestanden.

## Neu gebaut

`LWG_CHAT_OUTPUT_1`:

- erweitert direkte Chat-Ausgabe für `ticket.*` und `wheel.*`,
- nutzt vorhandene Helper/Textvarianten,
- keine neuen hartcodierten Texte,
- keine Änderung an Draw/Wheel/Exclusion/Raffle.

## Test offen

- `!ticket` muss nach Entry-Erstellung eine Chat-Bestätigung senden.
- `!wheel`/`!rad` muss nach Wheel-Claim eine Chat-Bestätigung senden.
- Testscript 1.3 später sauber mit SUCCESS prüfen.
