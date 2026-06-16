# FILES – stream-control-center

Stand: 2026-06-16

## Aktueller Arbeitsstand

```text
LC-MINIGAMES-2B FIX3 – Raffle Teilnahmekosten + Text-DB-Cleanup
```

## Für diesen Doku-Stand relevante geänderte Dateien

```text
backend/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_games.js
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
docs/current/CURRENT_CHAT_HANDOFF_LC_MINIGAMES_2B_DOCUMENTED.md
docs/modules/loyalty_giveaways.md
project-state/CURRENT_STATUS_LC_MINIGAMES_2B_DOCUMENTED.md
```

## Backend

```text
backend/modules/loyalty_giveaways.js
```

Aktueller dokumentierter Modulstand:

```text
moduleVersion = 0.1.13
moduleBuild = STEP_LC_MINIGAMES_2B_FIX3_TEXT_DB_CLEANUP
```

Wichtige Routen:

```text
GET  /api/loyalty/giveaways/status
GET  /api/loyalty/giveaways/texts
GET  /api/loyalty/raffle/status
GET  /api/loyalty/raffle/config
POST /api/loyalty/raffle/config
GET  /api/loyalty/giveaways/raffle/status
```

## Dashboard

```text
htdocs/dashboard/modules/loyalty_games.js
```

Enthält:

```text
Mini-Spiele Status-/Bedienansicht
Raffle Config unter Einstellungen
Raffle Texte unter Texte
bereichsgebundene Texttabelle ohne Alle-Textbereiche
```

## Textsystem

```text
backend/modules/helpers/helper_texts.js
```

Wird weiter genutzt für:

```text
helper_texts.renderModuleText(...)
```

Kein eigenes Zufallssystem im Raffle-/Giveaway-Modul.

## Produktive DB-Regel

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite niemals ersetzen, löschen oder neu bauen.
Vor Text-/DB-Cleanup wurde ein Backup empfohlen.
Text-Cleanup betrifft nur gezielte Seed-Textbereiche, keine Punkte/Transaktionen/User-Balances.
```

## Offene Testdateien / Befehle

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/config" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/texts" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/balance/forrestcgn?displayName=ForrestCGN" | ConvertTo-Json -Depth 6
```
