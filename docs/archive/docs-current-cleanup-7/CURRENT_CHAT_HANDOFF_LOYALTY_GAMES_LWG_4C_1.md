# CURRENT CHAT HANDOFF – Loyalty Games LWG-4C.1

Stand: 2026-06-08

## Neuer Stand

```text
STEP LWG-4C.1 – Quantity + Global Remove Fix
```

## Regel

```text
Restmenge wird nicht manuell eingetragen.
Gesamtmenge ist einzutragen und Standard ist 1.
Gewinn nach Auslosung entfernen ist eine globale Preset-Einstellung.
```

## Geaendert

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/presets.js
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
```

## Nicht geaendert

```text
kein Giveaway
keine Tickets
keine Kanalpunkte
keine Commands
keine Punktebuchung
keine Reward-Ausfuehrung
```

## Test

```text
Loyalty -> Loyalty Games -> Presets
```

Preset erstellen, Feld mit Gesamtmenge 1 erstellen, Restmenge nur anzeigen lassen.
