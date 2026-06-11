# CURRENT_STATUS – nach STEP225 / LWG-6.6

## Aktueller Stand

Das Loyalty-/Kekskrümel-System ist im Bereich Punkteanzeige, Admin-Punktebefehle und Gamble live nutzbar.

## Live bestätigt

```text
!punkte / !points
!givepoints
!setpoint
!gamble
```

## Gamble

```text
Status: live aktiv
Engine: live aktiv
Cooldown: 60000 ms/User
Prozent-Einsatz: bestätigt
Strukturierte Logs: bestätigt
Chat-Ausgabe: twitch_presence
```

## Relevante Versionen

```text
commands.js 0.2.3
Build: LWG_6_5_GAMBLE_RESULT_LOG_CLEANUP

loyalty_games.js 0.2.5
Build: STEP_LWG_6_5_GAMBLE_RESULT_LOG_CLEANUP
```

## Übergangsstatus

StreamElements darf noch parallel laufen, bis die vollständige Migration abgeschlossen ist.
