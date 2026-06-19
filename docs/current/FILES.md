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
tools/tests/loyalty_giveaway_wheel_interactive_test.ps1
```

## Aktueller ZIP-/Step-Stand

```text
LWG_CHAT_COMMANDS_1.zip
LWG_TESTSCRIPT_1_3_interactive_giveaway_wheel_summary_fix.zip
LWG_CHAT_COMMANDS_1_CONFIRMED_DOCS.zip
```

## Geänderte Dateien in `LWG_CHAT_COMMANDS_1`

```text
backend/modules/loyalty_giveaways.js
docs/steps/LWG_CHAT_COMMANDS_1_README.md
```

## Geänderte Dateien in `LWG_TESTSCRIPT_1_3`

```text
tools/tests/loyalty_giveaway_wheel_interactive_test.ps1
tools/tests/README_LWG_TESTSCRIPT_1_3.md
```

## Geänderte Dateien in `LWG_CHAT_COMMANDS_1_CONFIRMED_DOCS`

```text
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_LWG_CHAT_COMMANDS_1_CONFIRMED.md
docs/modules/loyalty_giveaways_CURRENT.md
project-state/CURRENT_STATUS_LWG_CHAT_COMMANDS_1_CONFIRMED.md
README_LWG_CHAT_COMMANDS_1_CONFIRMED_DOCS.md
```

## Nicht in diesem Doku-Step geändert

```text
backend/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
config/loyalty_games.json
config/loyalty_giveaway_exclusions.json
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

### Interaktiver Komplett-Test mit aktiven Chat-Commands

```text
Giveaway:          giveaway_1781869724371_2cdf71cc66cc312a
Titel:             Test
Mode:              wheel_single
Blocked Entry:     una_solala
Chat Entries:      RoxxyFoxxyCGN, EngelCGN, ForrestCGN per !ticket
Draw Open:         korrekt blockiert
Winner 1:          RoxxyFoxxyCGN → Wheel-Claim durch Chat erkannt
Winner 2:          EngelCGN      → Wheel-Claim durch Chat erkannt
Winner 3:          ForrestCGN    → Wheel-Claim durch Chat erkannt
Final:             kein eligible User mehr vorhanden
Felder:            8 → 5
Status:            alle erwarteten Gewinner wheel_completed
```

### Aktuell angelegtes frisches Test-Giveaway für Script-1.3-Endtest

```text
Giveaway:          giveaway_1781870456108_bc3cb113232e9e76
Titel:             Test
Status:            draft
Mode:              wheel_single
CanOpen:           true
```
