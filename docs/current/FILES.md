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
LWG_CHAT_OUTPUT_1.zip
LWG_CHAT_OUTPUT_1_DOCS.zip
```

## Geänderte Dateien in LWG_CHAT_OUTPUT_1

```text
backend/modules/loyalty_giveaways.js
docs/steps/LWG_CHAT_OUTPUT_1_README.md
```

## Geänderte Dateien in diesem Doku-Step

```text
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_LWG_CHAT_OUTPUT_1.md
docs/modules/loyalty_giveaways_CURRENT.md
project-state/CURRENT_STATUS_LWG_CHAT_OUTPUT_1.md
README_LWG_CHAT_OUTPUT_1_DOCS.md
```

## Bestätigte Test-Giveaway IDs

### Interaktiver Komplett-Test mit !ticket / !wheel

```text
Giveaway:          giveaway_1781869724371_2cdf71cc66cc312a
Titel:             Test
Status im Test:    open → closed_for_entries
Entries:           una_solala + RoxxyFoxxyCGN + EngelCGN + ForrestCGN
Excluded:          una_solala
Winner 1:          RoxxyFoxxyCGN
Winner 2:          EngelCGN
Winner 3:          ForrestCGN
Final:             kein eligible User mehr
Feldverbrauch:     8 → 5 verfügbare Felder
```

### Nächster frischer Testkandidat

```text
Giveaway:          giveaway_1781870456108_bc3cb113232e9e76
Titel:             Test
Status:            draft
Mode:              wheel_single
CanOpen:           true
```
