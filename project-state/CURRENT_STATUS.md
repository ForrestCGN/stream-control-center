# CURRENT_STATUS – STEP223 / LWG-6.4

Stand: 2026-06-11

## Status

```text
Loyalty-Basis live bestätigt
Admin-Points live bestätigt
Gamble live bestätigt
Prozent-Gamble bestätigt
Neue Gamble-Texte bestätigt
```

## Versionen

```text
commands.js       0.2.2 / LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE
loyalty.js        0.1.13
loyalty_games.js  0.2.4 / STEP_LWG_6_3_GAMBLE_TEXT_PERCENT_PARSER_CLEANUP
```

## Aktive Commands

```text
!punkte / !points
!givepoints
!setpoint
!gamble
```

## Bestätigter STEP222b-Test

```text
!gamble 10% funktioniert
Einsatz 10 bei Balance 100 bestätigt
Chattext enthält korrekten Einsatz
Balanceänderung bestätigt
Restore final 0/0/0 bestätigt
```

## Übergangsstatus

StreamElements kann noch parallel antworten. Das ist aktuell akzeptiert.
