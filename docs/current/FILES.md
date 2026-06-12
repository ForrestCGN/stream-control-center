# FILES – stream-control-center

Stand: 2026-06-12

## Aktueller bestätigter Dashboard-/Loyalty-Stand

```text
STEP235N – Doku-/Status-Refresh finaler STEP235-Stand
```

Bestätigte letzte Code-Commits:

```text
518dd6e4 STEP235M Remove Loyalty Runtime Shell Fallback
9ab5e619 STEP235J Remove Standalone Gamble Dashboard
0b44d8f6 STEP235H Config UX Standard
```

## Aktive Dashboard-/Loyalty-Dateien

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
```

## Entfernte / nicht mehr aktive Gamble-Standalone-Dateien

Diese Dateien sind nicht mehr Teil des Zielstands:

```text
htdocs/dashboard/loyalty-gamble.html
htdocs/dashboard/modules/loyalty-gamble.js
htdocs/dashboard/modules/loyalty-gamble.css
htdocs/dashboard/modules/loyalty-gamble-nav.js
htdocs/dashboard/modules/loyalty-gamble-shell-card.js
htdocs/dashboard/modules/loyalty-gamble-shell-card.css
htdocs/dashboard/index.html.step232a_lwg7_3a_backup_20260611_202157
```

## Weiterhin relevante Backend-Dateien

```text
backend/modules/loyalty.js
backend/modules/loyalty_games.js
backend/modules/loyalty_giveaways.js
backend/modules/commands.js
backend/modules/twitch_presence.js
backend/modules/communication_bus.js
```

## Weiterhin relevante Overlay-Dateien

```text
htdocs/overlays/loyalty/wheel_overlay.html
```

## Doku-Dateien dieses STEP235N-Pakets

```text
docs/current/CURRENT_STATUS.md
docs/current/CURRENT_CHAT_HANDOFF_STEP235_FINAL_LOYALTY_DASHBOARD_CLEANUP.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/NEXT_STEPS.md
docs/current/TODO.md
project-state/CURRENT_STATUS_STEP235_FINAL_LOYALTY_DASHBOARD_CLEANUP.md
```

## Testhinweise

Nach Dashboard-/Loyalty-Änderungen immer mindestens:

```powershell
node -c .\htdocs\dashboard\app.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

```text
/dashboard
Loyalty → Gamble
Loyalty → Config → Gamble
Loyalty → Core / Kekskrümel
Loyalty → Giveaways
```

## Weiterhin relevanter LWG-4Q.11 Test

```text
Test_LWG_4Q11_manual_winner_flow_ForrestCGN.ps1
```

Ergebnis:

```text
ModuleBuild: STEP_LWG_4Q_11
=== TEST OK: Alle aktivierten Szenarien erfolgreich ===
```
