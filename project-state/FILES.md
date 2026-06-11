# FILES – stream-control-center

Stand: 2026-06-11

## Aktueller Doku-/Test-STEP

```text
loyalty_step212_lwg5_4_points_runtime_test.zip
```

Enthalten:

```text
Test_STEP212_LWG5_4_points_command_runtime_ForrestCGN.ps1
docs/modules/loyalty.md
docs/current/CURRENT_CHAT_HANDOFF_STEP212_LWG5_4.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
README_STEP212_LWG5_4.md
```

## Aktueller Runtime-STEP

```text
loyalty_step210_lwg5_2_status_cleanup.zip
```

Enthalten:

```text
backend/modules/loyalty.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
```

## Vorherige Doku

```text
loyalty_step211_lwg5_3_documentation_handoff.zip
```

## Weiterhin relevante Runtime-Dateien

```text
backend/modules/loyalty.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
backend/modules/loyalty_giveaways.js
backend/modules/commands.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_texts.js
backend/core/database.js
```

## Tests

```text
Test_STEP212_LWG5_4_points_command_runtime_ForrestCGN.ps1
```

Ziel: kontrollierter Runtime-Test von `!punkte / !points` ohne dauerhafte Aktivierung.


## STEP212a / LWG-5.4a – Points Runtime Testscript Parserfix

```text
Stand: 2026-06-11
Typ: Testscript-/Doku-Hotfix
Runtime: unverändert
Grund: PowerShell-Parserfehler bei String mit $Enabled: behoben durch $($Enabled):
```
