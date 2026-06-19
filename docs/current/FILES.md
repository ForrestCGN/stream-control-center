# Files – Loyalty-Giveaways / CGN-Glücksrad aktueller Arbeitsstand

Stand: 2026-06-19

## Aktuell relevante Runtime-Dateien

```text
backend/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
config/loyalty_games.json
config/loyalty_giveaway_exclusions.json
htdocs/overlays/loyalty/wheel_overlay.html
```

## Aktueller ZIP-/Step-Stand

```text
LWG_GIVEAWAY_EXCLUSIONS_1B.zip
LWG_GIVEAWAY_EXCLUSIONS_1B_CONFIRMED_DOCS.zip
```

## Geänderte Dateien in `LWG_GIVEAWAY_EXCLUSIONS_1B`

```text
backend/modules/loyalty_giveaways.js
config/loyalty_giveaway_exclusions.json
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_LWG_GIVEAWAY_EXCLUSIONS_1B.md
docs/modules/loyalty_giveaways_CURRENT.md
project-state/CURRENT_STATUS_LWG_GIVEAWAY_EXCLUSIONS_1B.md
README_LWG_GIVEAWAY_EXCLUSIONS_1B.md
```

## Nicht in diesem Step geändert

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
config/loyalty_games.json
htdocs/overlays/loyalty/wheel_overlay.html
```

## Bestätigte Test-Giveaway IDs

### Alter Wheel-Test / Bug-Fund

```text
Giveaway:          giveaway_1781856708568_9653eba68a211017
Bound-Wheel:       giveawaywheel_1781856708568_839fb2b118fc40a3
Winner 1:          una_solala / Roadside Research (alter Draw, vor Exclusion-Fix)
Winner 2:          urlug / Valheim
Spin 2:            spin_1781863565409_d640d8c100226f77
Rest verfügbar:    6
Status danach:     cancelled
```

### Frischer Exclusion-Test

```text
Giveaway:          giveaway_1781865117837_a56d3fcb009a15a2
Titel:             Test
Bound-Wheel:       giveawaywheel_1781865117837_3d9cfcef7469aef2
Entries:           una_solala, udowb, engelcgn
Excluded:          una_solala
Winner:            udowb
Permission:        wheelperm_1781865357312_f86f36711269e3e3
Spin:              spin_1781865515072_d11827bafa8cd593
Gewinn:            Roadside Research
Feldverbrauch:     Roadside Research quantityRemaining 1 → 0
```
