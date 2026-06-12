# PROJECT STATE – LWG-4Q.12N Final Gamble/Giveaways Cleanup

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center

## Finaler Stand

```text
LWG-4Q.12N – Final Gamble/Giveaways Cleanup Docs + Next Chat Prompt
```

## Ergebnis

```text
Giveaways öffnen neues Giveaway-Control.
Tabs bleiben vollständig sichtbar.
Gamble und Config sind erreichbar.
Legacy-Giveaway-Code aus loyalty_games.js ist entfernt.
Standalone-Gamble-Shells sind entfernt.
Gamble rechnet verständlich:
  Gewinn = Einsatz dazu
  Verlust = Einsatz weg
Gamble-Config zeigt nur noch relevante Felder.
Cooldown gehört zum zentralen Command-System.
```

## Aktive Zielstruktur

```text
loyalty_games.js:
- Übersicht
- Glücksrad
- Presets
- Gamble
- Config
- Chat/Commands
- Verlauf
- Hinweise
- Bridge/Redirect zu Giveaways

loyalty_giveaways.js:
- Giveaway Control
- Erstellen/Bearbeiten
- Details
- Live-Steuerung
- Giveaway-Bound-Wheel-Editor
- Hard-Delete
```

## Gamble-Zielmodell

```text
!gamble 100 bei Gewinn:
  +100 Punkte

!gamble 100 bei Verlust:
  -100 Punkte

!gamble 10%:
  Einsatz wird aus aktuellem verfügbaren Stand berechnet
  Gewinn/Verlust nutzt denselben Einsatzbetrag
```

## Config-Zielmodell Gamble

```text
Engine aktiv
Command aktiv
Chat-Antwort
Gewinnchance %
Command-Cooldown pro User
Mindesteinsatz
Maximaleinsatz
Prozent-Einsätze erlauben
Keyword-Einsätze erlauben
```

Nicht sichtbar:

```text
Auszahlung x
Gamble-Cooldown pro User
Gamble-Cooldown global
```

## Tests

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
node -c .\htdocs\dashboard\app.js
node -c .\backend\modules\loyalty_games.js
node -c .\backend\modules\loyalty_games\gamble.js
```

Browser-Test:

```text
/dashboard
Loyalty → Giveaways
Tabs vollständig?
Gamble erreichbar?
Config erreichbar?
Loyalty → Config → Gamble ohne Auszahlung x?
Keine Engine-Cooldown-Felder?
Command-Cooldown sichtbar?
```

Chat-Test:

```text
!gamble 100
!gamble 10%
```

Erwartung:

```text
eine HeimaufsichtCGN-Nachricht
eine Textvariante
Gewinn = Einsatz dazu
Verlust = Einsatz weg
```
