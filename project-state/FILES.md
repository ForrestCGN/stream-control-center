# FILES – stream-control-center

Stand: 2026-06-11

## Aktueller dokumentierter STEP

```text
loyalty_step211_lwg5_3_documentation_handoff.zip
```

Enthält nur Doku-/Projektstatus-Dateien:

```text
docs/modules/README.md
docs/modules/loyalty.md
docs/modules/loyalty_games.md
docs/current/CURRENT_CHAT_HANDOFF_STEP211_LWG5_3.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
README_STEP211_LWG5_3.md
```

Keine Runtime-Dateien, keine Datenbank, keine Secrets.

## Aktueller Runtime-Code-STEP

```text
loyalty_step210_lwg5_2_status_cleanup.zip
```

Enthält:

```text
backend/modules/loyalty.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
README_STEP210_LWG5_2.md
```

Versionen:

```text
loyalty.js: 0.1.13 / STEP210
loyalty_games.js: 0.2.2 / STEP_LWG_5_2_STATUS_CLEANUP
```

## Vorheriger Runtime-Code-STEP

```text
loyalty_step209_lwg5_1_gamble_prepared.zip
```

Enthält:

```text
backend/modules/loyalty.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
README_STEP209_LWG5_1.md
```

Bestätigte Tests:

```text
Commands gamble/punkte/givepoints/setpoint disabled.
Available Balance / Ranking erreichbar.
Can-Afford blockiert zu hohe Beträge.
Gamble Play blockiert bei disabled mit 403 gamble_disabled.
```

## Weiterhin relevante Runtime-Dateien

```text
backend/modules/loyalty.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_games/presets.js
backend/modules/loyalty_games/shared.js
backend/modules/loyalty_giveaways.js
backend/modules/commands.js
backend/modules/communication_bus.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_messages.js
backend/modules/helpers/helper_communication.js
backend/core/database.js
```

## Weiterhin relevante Dashboard-/Overlay-Dateien

```text
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/index.html
htdocs/overlays/loyalty/wheel_overlay.html
```

## Bestätigter Giveaways-Code-STEP

```text
STEP_LWG-4Q.11_manual_winner_flow_prize_quantity_cleanup.zip
```

Enthalten laut Artefakt:

```text
backend/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/index.html
Test_LWG_4Q11_manual_winner_flow_ForrestCGN.ps1
```

## UI-Testdateien – nicht als finaler Standard verwenden

Diese Scripts wurden im Verlauf erzeugt, waren aber zu fehleranfällig oder zu umständlich:

```text
Test_LWG_4Q10_ui_assisted_dashboard_scenarios_ForrestCGN.ps1
Test_LWG_4Q10_ui_assisted_dashboard_scenarios_ForrestCGN_v2.ps1
Test_LWG_4Q11_ui_assisted_dashboard_scenarios_ForrestCGN.ps1
Test_LWG_4Q11_ui_assisted_dashboard_scenarios_ForrestCGN_v2.ps1
Test_LWG_4Q11_ui_assisted_dashboard_scenarios_ForrestCGN_v3.ps1
```

Künftige UI-Prüfung soll neu, klein und minimal aufgebaut werden.
