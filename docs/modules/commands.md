# Modul: commands

## Stand nach STEP225 / LWG-6.6

Bestätigte Version:

```text
commands.js 0.2.3
Build: LWG_6_5_GAMBLE_RESULT_LOG_CLEANUP
```

## Aufgabe

Das `commands`-Modul verarbeitet Chat-Commands aus dem EventBus/Chat-System und ruft die zuständigen Modul-Endpunkte auf.

## Aktive relevante Commands

```text
!punkte / !points
!givepoints
!setpoint
!gamble
```

## Gamble-Integration

`!gamble` ist aktiv und zeigt auf:

```text
/api/loyalty/games/runtime/chat-command
```

Die Command-Bridge sendet Resultate über:

```text
twitch_presence.sendChatMessage(...)
```

## Strukturierte Gamble-Daten

Seit STEP224 werden strukturierte Ergebnisfelder durchgereicht und im Command-Execution-Log gespeichert, darunter:

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

## Hinweis

Der alte STEP221-Aktivator ist für ältere `commands.js`-Versionen gebaut und erwartet `0.2.2`.  
Für den aktuellen Stand wurde STEP224A verwendet.
