# CURRENT CHAT HANDOFF – LWG-4Q.12K Gamble Single Text Variant Fix

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Backend / Loyalty Games / Gamble / Chattexte

## Problem

Beim Gamble wurde in einer einzigen Chatnachricht nicht nur eine Textvariante ausgegeben, sondern mehrere aktive Varianten hintereinander:

```text
:slot_machine: ... Verloren. Neuer Stand: ...
:cookie: ... Niete. Neuer Stand: ...
:game_die: ... Diesmal gewinnt die Keksbank. Neuer Stand: ...
```

Das war keine doppelte Punktebuchung und kein mehrfacher Command-Handler, sondern ein Textvarianten-/Legacy-Textproblem.

## Ursache

Die alte Single-Text-Tabelle kann Varianten als mehrzeiligen Text enthalten. Beim Migrieren/Lesen kann so ein mehrzeiliger Text als eine Variante behandelt werden. `renderGameText()` hat Zeilenumbrüche bisher nur durch Leerzeichen ersetzt. Dadurch wurden mehrere Varianten zu einer langen Chatnachricht zusammengezogen.

## Änderung

Geänderte Datei:

```text
backend/modules/loyalty_games.js
```

Neu ergänzt:

```text
pickSingleRenderedTextLine(value)
```

`renderGameText()` nutzt diese Funktion jetzt, bevor die Chatnachricht bereinigt/gekürzt wird.

Verhalten:

```text
Wenn ein gerenderter Text mehrere Zeilen enthält, wird genau eine nicht-leere Zeile zufällig gewählt.
Wenn der Text nur eine Zeile enthält, bleibt er unverändert.
```

## Nicht geändert

```text
Punktestand
SQLite-Daten
Gamble-Wahrscheinlichkeit
Gamble-Auszahlungslogik
Dashboard-UI
Command-Registrierung
StreamElements
```

## Erwartetes Ergebnis

Pro Gamble-Ergebnis wird weiterhin genau eine Chatnachricht gesendet, aber diese enthält nur noch eine Textvariante.

Beispiel:

```text
🎰 ForrestCGN setzt 349 Kekskrümel und die Keksdose bleibt zu. Verloren. Neuer Stand: 3141.
```

statt drei Varianten hintereinander.

## Tests

Beim Erstellen der ZIP erfolgreich:

```text
node -c backend/modules/loyalty_games.js
```

Nach dem Entpacken testen:

```powershell
node -c .\backend\modules\loyalty_games.js
```

Live-Test:

```text
!gamble 100
Erwartung:
- genau eine HeimaufsichtCGN-Nachricht
- in dieser Nachricht genau eine Textvariante
- Punktestand plausibel
```

## StepDone

```powershell
.\stepdone.cmd "LWG-4Q.12K Fix Gamble Single Text Variant"
```
