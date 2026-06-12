# FILES

Stand: LWG-4Q.12R / Documentation & Next Chat Handoff
Datum: 2026-06-12

## In diesem Doku-ZIP enthalten

```text
README_LWG_4Q12R.md
NEXT_CHAT_PROMPT_LWG_4Q12R.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/current/CURRENT_CHAT_HANDOFF_LWG_4Q12R_DOCUMENTATION_AND_NEXT_CHAT.md
```

## Zuletzt gelieferte Code-/UI-ZIPs

```text
LWG-4Q.12O_Giveaway-Control_UI_Cleanup.zip
LWG-4Q.12P_Gamble_UI_Cleanup.zip
LWG-4Q.12Q_Giveaway_Wheel_Editor_UI_Cleanup.zip
```

## Wichtige Runtime-Dateien aus den letzten Schritten

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
htdocs/dashboard/modules/loyalty_giveaways_cleanup.css
htdocs/dashboard/modules/loyalty_giveaways_wheel_editor_cleanup.css
```

## Wichtige Backend-Dateien für spätere Prüfung

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
backend/modules/loyalty_giveaways.js
backend/modules/commands.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_messages.js
```

## Wichtige Datenbanktabellen für spätere Prüfung

Nicht ersetzen, nicht neu bauen, nur sicher migrieren/lesen:

```text
command_execution_log
loyalty_games_dashboard_audit
module_texts
module_text_variants
loyalty_giveaways
loyalty_giveaway_entries
loyalty_giveaway_winners
loyalty_giveaway_wheel_permissions
```

## Durch diesen Doku-Step NICHT geändert

```text
Backend-Code
Dashboard-Code
Datenbank
Runtime-Konfiguration
Commands
Twitch-/Streamer.bot-Flows
```
