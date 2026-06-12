# CURRENT CHAT HANDOFF – LWG-4Q.12M Gamble Config Cleanup

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard + Backend / Loyalty Games / Gamble

## Anlass

Nach LWG-4Q.12K und LWG-4Q.12L war die Gamble-Logik fachlich vereinfacht:

```text
Gewonnen = Einsatz dazu
Verloren = Einsatz weg
```

Im Dashboard waren aber noch Felder sichtbar, die nicht mehr zum Zielmodell passen oder doppelte Zuständigkeit erzeugen:

```text
Auszahlung x
Gamble-Cooldown pro User
Gamble-Cooldown global
```

Außerdem wurde geklärt: Der Cooldown gehört bei `!gamble` in das zentrale Command-System, nicht zusätzlich in die Gamble-Engine.

## Zielzustand

```text
Engine aktiv
  -> Gamble/API/Logik grundsätzlich verfügbar

Command aktiv
  -> schaltet !gamble im zentralen Command-System ein/aus

Chat-Antwort
  -> steuert, ob das Ergebnis in den Chat geschrieben wird

Command-Cooldown pro User
  -> einziger sichtbarer Cooldown für !gamble

Gamble-Engine
  -> rechnet Gewinn/Verlust, aber verwaltet keinen zusätzlichen Cooldown
```

## Geänderte Dateien

```text
htdocs/dashboard/modules/loyalty_games.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
```

## Änderungen Dashboard

In `htdocs/dashboard/modules/loyalty_games.js` entfernt/ausgeblendet:

```text
Auszahlung x
Gamble-Cooldown pro User
Gamble-Cooldown global
```

Sichtbar bleiben:

```text
Engine aktiv
Command aktiv
Chat-Antwort
Gewinnchance %
Command-Cooldown pro User (Sek.)
Mindesteinsatz
Maximaleinsatz
Prozent-Einsätze erlauben
Keyword-Einsätze erlauben
```

Die Gamble-Statuskarten zeigen nun:

```text
Gewinn/Verlust = Einsatz
Command-Cooldown
```

statt Multiplikator-/Engine-Cooldown-Logik.

## Änderungen Backend-Write

In `backend/modules/loyalty_games.js` erzwingt der Dashboard-Write für die entfernten Engine-Felder:

```text
games.gamble.payoutMultiplier = 2
games.gamble.userCooldownMs = 0
games.gamble.globalCooldownMs = 0
```

Damit bleibt die interne Config sauber, auch wenn alte Werte noch in der Datenbank stehen.

## Enthaltene vorherige Fixes

Diese ZIP enthält außerdem die aktuellen Backend-Fixes aus den vorherigen Schritten:

```text
LWG-4Q.12K:
Gamble-Chattext gibt nur eine Textvariante aus.

LWG-4Q.12L:
Gamble-Engine rechnet bei Gewinn +Einsatz und bei Verlust -Einsatz.
```

## Nicht geändert

```text
keine rückwirkenden Punktedaten
keine alten Transaktionen
keine Gewinnchance
keine Command-Definitionen außer normalen Dashboard-Writes
keine Textvarianten-Inhalte
keine StreamElements-Änderung
```

## Tests

Beim Erstellen der ZIP erfolgreich:

```text
node -c htdocs/dashboard/modules/loyalty_games.js
node -c backend/modules/loyalty_games.js
node -c backend/modules/loyalty_games/gamble.js
```

## Nach dem Entpacken testen

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\backend\modules\loyalty_games.js
node -c .\backend\modules\loyalty_games\gamble.js
```

Dashboard prüfen:

```text
Loyalty -> Config -> Gamble
```

Erwartung:

```text
Auszahlung x ist nicht mehr sichtbar.
Gamble-Cooldown pro User ist nicht mehr sichtbar.
Gamble-Cooldown global ist nicht mehr sichtbar.
Command-Cooldown pro User ist sichtbar.
```

Danach einmal Speichern, damit die entfernten Engine-Felder intern auf saubere Werte gesetzt werden.

## StepDone

```powershell
.\stepdone.cmd "LWG-4Q.12M Gamble Config Cleanup"
```
