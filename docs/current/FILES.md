# FILES – stream-control-center

Stand: 2026-06-16

## Aktueller Arbeitsstand

```text
LC-CORE-LIVE-CLEANUP-2 – Live-only geprüft, Shadow-Migration abgeschlossen
```

## Für diesen Doku-Stand relevante geänderte Dateien

```text
backend/modules/loyalty.js
htdocs/dashboard/modules/loyalty.js
backend/modules/loyalty.js
backend/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty_games.js
tools/loyalty_migrate_shadow_to_live_once.js
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/FILES.md
docs/current/CHANGELOG.md
docs/current/CURRENT_CHAT_HANDOFF_LC_CORE_LIVE_CLEANUP_2.md
docs/modules/loyalty.md
project-state/CURRENT_STATUS_LC_CORE_LIVE_CLEANUP_2.md
```

## Backend Loyalty Core

```text
backend/modules/loyalty.js
```

Aktueller geprüfter Live-Stand:

```text
module = loyalty
version = 0.1.24
mode = live
enabled = true
shadowMode = false
```

Wichtige Routen:

```text
GET  /api/loyalty/status
GET  /api/loyalty/settings
POST /api/loyalty/settings
GET  /api/loyalty/transactions
GET  /api/loyalty/balance/:login
GET  /api/loyalty/users
```

## Backend Mini-Spiele / Raffle

```text
backend/modules/loyalty_giveaways.js
```

Aktueller dokumentierter Modulstand:

```text
loyalty.js version = 0.1.24
loyalty_giveaways.js moduleVersion = 0.1.13
loyalty_giveaways.js moduleBuild = STEP_LC_MINIGAMES_2B_FIX3_TEXT_DB_CLEANUP
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
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty_games.js
```

Enthält:

```text
Loyalty-Core Live-only Ansicht
Status Aktiv/Inaktiv statt Shadow/Live Fokus
Loyalty Core Status-/Config-Anzeige auf Aktiv/Inaktiv
Mini-Spiele Status-/Bedienansicht
Raffle Config unter Einstellungen
Raffle Texte unter Texte
bereichsgebundene Texttabelle ohne Alle-Textbereiche
```

## Migrationstool

```text
tools/loyalty_migrate_shadow_to_live_once.js
```

Genutzt für:

```text
Shadow->Live Migration normaler User
Ausschluss Test-/Bridge-/Diagnose-User
gezieltes Nullen restlicher Shadow-Werte
Abschlussprüfung candidates=0 totalShadow=0
```

Das Tool bleibt vorerst als Archiv-/Diagnosewerkzeug im Projekt. Es soll nicht automatisch regelmäßig ausgeführt werden.

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
Vor Text-/DB-Cleanup und Migration wurde ein Backup empfohlen.
Shadow-Spalten bleiben vorerst bestehen und werden nicht blind gedroppt.
```

## Offene Testbefehle

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/balance/urlug?displayName=Urlug" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/balance/tronic6?displayName=Tronic6" | ConvertTo-Json -Depth 8
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status" | ConvertTo-Json -Depth 5
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/raffle/config" | ConvertTo-Json -Depth 6
Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/giveaways/texts" | ConvertTo-Json -Depth 6
```
