# FILES – stream-control-center

Stand: 2026-06-11

## Aktueller bestätigter Code-STEP

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

## Bestätigte Testdatei

```text
Test_LWG_4Q11_manual_winner_flow_ForrestCGN.ps1
```

Ergebnis:

```text
ModuleBuild: STEP_LWG_4Q_11
=== TEST OK: Alle aktivierten Szenarien erfolgreich ===
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

Künftige UI-Prüfung soll neu und minimal aufgebaut werden.

## Doku-Paket

```text
STEP_LWG-4Q.11_documentation_handoff.zip
```

Enthält nur Doku-/Projektstatus-Dateien, keine Runtime-Dateien, keine Datenbank, keine Secrets.

## Weiterhin relevante Runtime-Dateien

```text
backend/modules/loyalty_giveaways.js
backend/modules/loyalty_games.js
backend/modules/loyalty.js
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/index.html
```
