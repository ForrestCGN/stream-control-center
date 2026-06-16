# FILES – stream-control-center

Stand: 2026-06-16

## Aktueller Arbeitsstand

```text
LC-MINIGAMES-2C3 FIX1 – Mini-Spiel-Auswahl kompakt, Raffle-Logs/Statistik funktional geprüft
```

## Für diesen Doku-Stand relevante geänderte Dateien

```text
backend/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty.js
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
docs/current/CURRENT_CHAT_HANDOFF_LC_MINIGAMES_2C3.md
docs/modules/loyalty.md
docs/modules/loyalty_giveaways.md
project-state/CURRENT_STATUS_LC_MINIGAMES_2C3.md
```

## Backend

```text
backend/modules/loyalty_giveaways.js
```

Aktueller dokumentierter Modulstand:

```text
moduleVersion = 0.1.14
moduleBuild = STEP_LC_MINIGAMES_2C1_FIX1_RAFFLE_LOG_STATUS_USER
```

Spätere relevante Dashboard-only-Fixes:

```text
LC-MINIGAMES-2C1-FIX2 Raffle-Logs vollständiger gemappt
LC-MINIGAMES-2C2 Raffle-Statistik mit User-Sortierung
LC-MINIGAMES-2C3 Mini-Spiele Detail-Navigation
LC-MINIGAMES-2C3-FIX1 Mini-Spiel-Auswahl kompakt
```

Wichtige Routen:

```text
GET  /api/loyalty/giveaways/status
GET  /api/loyalty/giveaways/texts
GET  /api/loyalty/raffle/status
GET  /api/loyalty/raffle/config
POST /api/loyalty/raffle/config
GET  /api/loyalty/raffle/logs
GET  /api/loyalty/raffle/stats
GET  /api/loyalty/giveaways/raffle/status
```

## Dashboard

```text
htdocs/dashboard/modules/loyalty_games.js
```

Enthält aktuell:

```text
Mini-Spiele kompakte Spielauswahl
Raffle Detailansicht Übersicht/Statistik
Raffle Statistik mit Sortierung und User-Dropdown
Raffle Logs Mapping für Event=Raffle und Statusfilter
Gamble Detail nur bei Auswahl Gamble
Raffle Config unter Einstellungen
Raffle Texte unter Texte
bereichsgebundene Texttabelle ohne Alle-Textbereiche
```

```text
htdocs/dashboard/modules/loyalty.js
```

Enthält aktuell:

```text
Loyalty-Core Anzeige auf Aktiv/Inaktiv bzw. Live-only bereinigt
Shadow-/Import-Hauptstatus-Wording entfernt
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
Raffle-Logs/Stats ergänzen Anzeige und Logik, löschen aber keine alten Punkte/Transaktionen/User-Balances.
```

## Offene Testbefehle

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/config" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/logs" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/stats" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/balance/urlug?displayName=Urlug" | ConvertTo-Json -Depth 8
```
