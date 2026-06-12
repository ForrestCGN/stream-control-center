# FILES – stream-control-center

Stand: 2026-06-12

## Aktueller Stand

```text
LWG-4Q.12N – Final Gamble/Giveaways Cleanup Docs + Next Chat Prompt
```

## Aktive Dashboard-Dateien für Loyalty

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

## Aktive Backend-Dateien für Loyalty/Gamble

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_games/presets.js
backend/modules/loyalty_giveaways.js
backend/modules/commands.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_settings.js
backend/core/database.js
```

## Zuständigkeiten

### htdocs/dashboard/modules/loyalty_games.js

```text
Übersicht
Glücksrad
Presets
Gamble
Config
Chat/Commands
Verlauf
Hinweise
Redirect/Bridge ins neue Giveaway-Control
```

### htdocs/dashboard/modules/loyalty_giveaways.js

```text
Giveaway Control
Giveaway-Liste
aktive & vorbereitete Giveaways
Giveaway erstellen/bearbeiten
Details
Live-Steuerung
Bound-Wheel-Editor für Giveaways
Hard-Delete
```

### backend/modules/loyalty_games.js

```text
Loyalty-Games Host
Gamble-Dashboard-Config API
Gamble-Texte/Variantenseeding
Gamble-Command-Runtime
Wheel/Presets-Routing
Dashboard-Audit für Gamble
```

### backend/modules/loyalty_games/gamble.js

```text
Gamble-Engine
Einsatz-Parsing
feste Einsätze
Prozent-Einsätze
Keyword-Einsätze
Gewinn/Verlust
Punktebuchung
Session/Event-Daten
```

## Nicht mehr aktive / entfernte Altlasten

```text
alte Inline-Giveaway-Ansicht in loyalty_games.js
alter Inline-Giveaway-Wheel-Editor in loyalty_games.js
loyalty-gamble.html
loyalty-gamble.js
loyalty-gamble.css
loyalty-gamble-nav.js
loyalty-gamble-shell-card.js
loyalty-gamble-shell-card.css
STEP232-Gamble-Shell
Standalone-Gamble-Dashboard
```

## ZIP-/Deploy-Regel

ZIPs immer mit echten Zielpfaden liefern, z. B.:

```text
backend/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.js
docs/current/CURRENT_STATUS.md
project-state/CURRENT_STATUS_*.md
```

Keine losen Dateien ohne Zielpfad.
