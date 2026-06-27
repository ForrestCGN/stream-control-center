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
LWG_CHAT_OUTPUT_1B.zip
LWG_CHAT_OUTPUT_1B_DOCS.zip
```

## Geänderte Dateien in `LWG_CHAT_OUTPUT_1B`

```text
backend/modules/loyalty_giveaways.js
docs/steps/LWG_CHAT_OUTPUT_1B_README.md
```

## Geänderte Dateien in `LWG_CHAT_OUTPUT_1B_DOCS`

```text
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_LWG_CHAT_OUTPUT_1B.md
docs/modules/loyalty_giveaways_CURRENT.md
project-state/CURRENT_STATUS_LWG_CHAT_OUTPUT_1B.md
README_LWG_CHAT_OUTPUT_1B_DOCS.md
```

## Nicht in diesem Step geändert

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
config/loyalty_games.json
config/loyalty_giveaway_exclusions.json
htdocs/overlays/loyalty/wheel_overlay.html
DB-Schema
Dashboard-Dateien
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

### Chat-Ausgabe-Beobachtung vor 1B

```text
!ticket und !wheel/!rad senden nach LWG_CHAT_OUTPUT_1 grundsätzlich Chatmeldungen.
Einige Meldungen enthielten aber zwei Varianten/Sätze in einer Nachricht.
```

### Letzter genannter Testkandidat

```text
Giveaway:          giveaway_1781879638591_c1734bfe1e834396
Titel:             test
Status:            draft
Mode:              wheel_single
Wheel:             true
SetupComplete:     true
CanOpen:           true
```
