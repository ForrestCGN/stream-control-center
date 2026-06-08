# Loyalty Wheel / CGN Glücksrad

Stand: 2026-06-08  
Version: 0.2.0  
STEP: LWG-4C

## Zweck

Das Wheel kann aus der Config oder ueber Datenbank-Presets drehen.

## Preset-Editor

LWG-4C bringt den ersten Dashboard-Editor:

```text
Loyalty -> Loyalty Games -> Presets
```

Funktionen:

```text
- Presets listen
- Felder listen
- Standalone-Preset erstellen
- Feld erstellen/bearbeiten/deaktivieren
- Preset kopieren
- Preset abschliessen
- Preset-Testdrehung starten
```

## Regeln

```text
- Preset darf gewaehlt werden.
- Ergebnis darf nicht gewaehlt werden.
- Ergebnis wird im Backend bestimmt.
- Nicht bearbeitbare Presets sind read-only.
- Giveaway-verknuepfte Presets werden spaeter nur ueber Giveaway editierbar.
```

## Noch nicht umgesetzt

```text
- Giveaways
- Kanalpunkte
- Chat-Commands
- Reward-Ausfuehrung
```
