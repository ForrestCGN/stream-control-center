# Project State – LWG Chat Commands 1 bestätigt

Stand: 2026-06-19

## Projektbereich

`stream-control-center` / Loyalty-Giveaways / CGN-Glücksrad

## Bestätigter Stand

```text
loyalty_giveaways: 0.1.16 / LWG_CHAT_COMMANDS_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Live bestätigt

- `!ticket` ist für normale Giveaways aktiv.
- `!wheel` und `!rad` sind für Wheel-Claims aktiv.
- `!join` und `!raffle` bleiben unverändert Raffle-Commands.
- Zentrales Command-System routet `ticket` und `wheel` auf:
  - `POST /api/loyalty/giveaways/runtime/chat-command`

## Komplett-Test

Test-Giveaway:

```text
giveaway_1781869724371_2cdf71cc66cc312a
```

Bestätigt:

```text
Entries: 4
Blocked visible entry: una_solala
Chat entries via !ticket: 3
Draw aus open: blockiert
Winner 1: RoxxyFoxxyCGN → Wheel-Claim erkannt
Winner 2: EngelCGN → Wheel-Claim erkannt
Winner 3: ForrestCGN → Wheel-Claim erkannt
Final no eligible draw: blockiert
Fields: 8 -> 5
Winners: wheel_completed
```

## Aktuelle Artefakte

```text
LWG_CHAT_COMMANDS_1.zip
LWG_TESTSCRIPT_1_3_interactive_giveaway_wheel_summary_fix.zip
LWG_CHAT_COMMANDS_1_CONFIRMED_DOCS.zip
```

## Nächster Schritt

- Testscript 1.3 mit `giveaway_1781870456108_bc3cb113232e9e76` einmal auf sauberen `SUCCESS`-Abschluss prüfen.
- Danach Test-Giveaways löschen/markieren.
- Danach Dashboard-/UX-Planung für Live-Draw + `!rad`-Wartezustand.
