# FILES – stream-control-center

Stand: 2026-06-12

## Aktueller bestätigter Dashboard-/Loyalty-Stand

```text
STEP235S – Final Gamble Config Cleanup
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

## Aktive Backend-Dateien

```text
backend/modules/loyalty.js
backend/modules/loyalty_games.js
backend/modules/loyalty_giveaways.js
backend/modules/commands.js
backend/modules/twitch_presence.js
backend/modules/communication_bus.js
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

## Doku-Dateien dieses STEP235S-Pakets

```text
docs/current/CURRENT_STATUS.md
docs/current/CURRENT_CHAT_HANDOFF_STEP235S_FINAL_GAMBLE_CONFIG_CLEANUP.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/current/NEXT_STEPS.md
docs/current/TODO.md
project-state/CURRENT_STATUS_STEP235S_FINAL_GAMBLE_CONFIG_CLEANUP.md
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
