# Modul: loyalty_games

## Stand nach STEP225 / LWG-6.6

Bestätigte Version:

```text
loyalty_games.js 0.2.5
Build: STEP_LWG_6_5_GAMBLE_RESULT_LOG_CLEANUP
```

## Aktiver Live-Stand

```text
!gamble: aktiv
Gamble Engine: aktiv
User-Cooldown: 60000 ms
Global-Cooldown: 0 ms
Win-Chance: 47 %
Payout-Multiplier: 2
```

## Unterstützte Einsätze

Bestätigt:

```text
!gamble 10%
```

Vorbereitet/unterstützt durch Parser-Cleanup:

```text
!gamble 10
!gamble 10%
!gamble 10 %
!gamble 10 prozent
!gamble half
!gamble halb
```

## Ergebnisdaten

Seit STEP224 werden strukturierte Gamble-Daten zurückgegeben und geloggt:

```text
bet
outcome
won
grossPayout
winAmount
netProfit
balanceBefore
balanceAfter
availableBefore
availableAfter
```

## Chat-Ausgabe

Die Gamble-Chat-Ausgabe läuft über die Command-Bridge und `twitch_presence`.

## Übergang mit StreamElements

StreamElements darf aktuell parallel laufen.  
Das ist bewusst erlaubt, solange die vollständige Umstellung noch nicht abgeschlossen ist.
