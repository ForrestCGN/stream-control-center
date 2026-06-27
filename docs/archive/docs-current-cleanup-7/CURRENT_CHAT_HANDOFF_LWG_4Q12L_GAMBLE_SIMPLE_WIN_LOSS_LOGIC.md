# CURRENT CHAT HANDOFF – LWG-4Q.12L Gamble Simple Win/Loss Logic

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Backend / Loyalty Games / Gamble

## Problem

Die bisherige Gamble-Logik hat wie eine Casino-Bruttoauszahlung gerechnet:

```text
Einsatz immer zuerst abziehen
bei Gewinn grossPayout gutschreiben
netProfit = grossPayout - bet
```

Dadurch war `payoutMultiplier = 1` ein Nullgeschäft:

```text
Start: 3143
Einsatz: 314
-314 +314 = 3143
```

Für das CGN-Kekskrümel-Gamble soll es aber einfach und verständlich sein:

```text
Gewonnen = Einsatz dazu
Verloren = Einsatz weg
```

Das gilt für feste Einsätze und Prozent-Einsätze gleichermaßen.

## Geänderte Datei

```text
backend/modules/loyalty_games/gamble.js
```

## Neue Logik

```text
won === true:
  awardPoints(bet)

won === false:
  spendPointsSafely(bet)
```

Dabei bleibt:

```text
bet = Einsatz/Risiko
grossPayout = bei Gewinn bet, sonst 0
netProfit = bei Gewinn +bet, bei Verlust -bet
summaryBefore / summaryAfter bleiben echte Kontostände
Session/Audit/Events bleiben erhalten
```

## Nicht geändert

```text
keine rückwirkende Änderung alter Transaktionen
keine Änderung an bestehenden Punktedaten
keine Änderung der Gewinnchance
keine Änderung am Cooldown
keine Änderung am Textvarianten-System
keine Änderung am Dashboard
keine Änderung an StreamElements
```

## Erwartetes Beispiel

```text
Start: 3143
!gamble 10% = 314

Verlust:
3143 - 314 = 2829

Gewinn:
3143 + 314 = 3457
```

## Tests

Beim Erstellen der ZIP erfolgreich:

```text
node -c backend/modules/loyalty_games/gamble.js
```

Nach dem Entpacken testen:

```powershell
node -c .\backend\modules\loyalty_games\gamble.js
node -c .\backend\modules\loyalty_games.js
```

Live-Test:

```text
!gamble 100
!gamble 10%
```

Erwartung:

```text
Gewinn erhöht den Stand um den Einsatz.
Verlust senkt den Stand um den Einsatz.
Funktioniert bei Zahl und Prozent.
Genau eine Chatnachricht mit genau einer Textvariante.
```

## StepDone

```powershell
.\stepdone.cmd "LWG-4Q.12L Gamble Simple Win Loss Logic"
```
