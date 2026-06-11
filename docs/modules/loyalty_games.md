# Loyalty Games – Stand STEP223 / LWG-6.4

## Live-Basis

```text
backend/modules/loyalty_games.js
Version 0.2.4
Build   STEP_LWG_6_3_GAMBLE_TEXT_PERCENT_PARSER_CLEANUP
```

## Aktiver Stand

```text
Gamble-Engine aktiv
!gamble Command aktiv
User-Cooldown wiederhergestellt: 60000 ms
Global-Cooldown: 0 ms
Serverseitiger Zufall: crypto.randomInt
predictable=False
```

## Bestätigte Eingaben

```text
!gamble 2       fester Einsatz
!gamble 10%     Prozent-Einsatz bestätigt
!gamble 10 %    vorbereitet
!gamble 10 prozent vorbereitet
!gamble half / halb vorbereitet
```

## Bestätigter STEP222b-Test

```text
Startbalance: 100
Command:      !gamble 10%
Expected Bet: 10
Chattext:     setzt 10 Kekskrümel
Balance:      110 im Testlauf
Restore:      final 0/0/0
```

## Textstand

Die alten Platzhalter-/Roulette-Texte wurden durch kürzere CGN-/Kekskrümel-Texte ersetzt.

Beispielrichtung:

```text
🎰 <User> setzt <Einsatz> Kekskrümel und die Keksmaschine rattert...
```

## Übergang mit StreamElements

StreamElements darf vorerst parallel aktiv bleiben. Dadurch können weiterhin SE-Antworten für alte SE-Commands sichtbar sein.

Spätere vollständige Umstellung:

```text
StreamElements !gamble deaktivieren
StreamElements !roulette deaktivieren, falls vorhanden
Node-!gamble als einzige Gamble-Quelle verwenden
```
