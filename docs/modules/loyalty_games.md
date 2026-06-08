# Loyalty Games Modul

Stand: 2026-06-08  
Version: Backend 0.2.0 / Dashboard LWG-4C  
STEP: LWG-4C

## Zweck

`loyalty_games` ist der Spiele-/Wheel-Bereich unter dem fachlichen Loyalty-Hauptbereich.

Aktuell enthalten:

```text
- Wheel / Glücksrad
- Wheel-Presets
- Preset-Felder
- Dreh-Verlauf fuer Preset-Spins
- Dashboard-Preset-Editor
```

## Dateien

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_games/presets.js
backend/modules/loyalty_games/shared.js
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
```

## Dashboard

Pfad:

```text
Loyalty -> Loyalty Games
```

Tabs:

```text
Übersicht
Glücksrad
Presets
Verlauf
Hinweise
```

Preset-Funktionen:

```text
- Preset anzeigen
- Preset erstellen
- Preset kopieren
- Preset aktivieren/pausieren/abschliessen/loeschen
- Felder erstellen/bearbeiten/deaktivieren
- Test-Drehung mit Preset starten
```

## Nicht enthalten

```text
- Giveaways
- Tickets
- Punktebuchung
- Reward-Ausfuehrung
- Chat-Commands
- Kanalpunkte
```

## Fairness

```text
Dashboard kann ein Preset starten, aber kein Ergebnis setzen.
Das Ergebnis wird weiterhin backendseitig per crypto.randomInt bestimmt.
```

## Offene Punkte

```text
- Giveaway Backend
- Giveaway Editor
- Command- und Kanalpunkte-Ausloesung
- EventBus-Kommunikation weiter konkretisieren
```
