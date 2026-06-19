# Project State – LWG_BOUND_WHEEL_FIELD_COUNT_1

Datum: 2026-06-19

## Stand

Datei-/ZIP-Step `LWG_BOUND_WHEEL_FIELD_COUNT_1` vorbereitet.

## Ziel

Giveaway-bound Wheels laufen heute streamtauglich:

```text
2+ verfügbare Gewinne  → normaler Spin, exakt verfügbare Felder
1 verfügbarer Gewinn   → Direktvergabe, kein normaler Spin
0 verfügbare Gewinne   → Block
```

## Betroffene Dateien

```text
backend/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
```

## Doku aktualisiert

```text
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_LWG_BOUND_WHEEL_FIELD_COUNT_1.md
docs/modules/loyalty_giveaways_CURRENT.md
```

## Syntax geprüft

```text
node -c backend/modules/loyalty_games/wheel.js
node -c backend/modules/loyalty_games.js
node -c backend/modules/loyalty_giveaways.js
```

Alle Checks erfolgreich.

## Wichtig

Vor Live-Deploy eine Kopie der aktuell laufenden Dateien erstellen.

## Später wieder anfassen

Dashboard-Config für diese Runtime-Regel ergänzen:

- Verhalten bei 1 verbleibendem Gewinn.
- Anzeige/Block bei 0 verfügbaren Gewinnen.
- Optionale Letzter-Gewinn-Darstellung.
- Trennung Giveaway-bound Wheels vs. Standalone-/Preset-Wheels.
