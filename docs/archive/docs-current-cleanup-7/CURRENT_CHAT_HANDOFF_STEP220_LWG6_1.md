# Current Chat Handoff – STEP220 / LWG-6.1

## Ziel

Gamble kontrolliert testen, ohne Gamble dauerhaft live zu aktivieren.

## Neuer Runtime-Stand

- `backend/modules/loyalty_games.js`
- Version: `0.2.3`
- Build: `STEP_LWG_6_1_GAMBLE_SETTINGS_RUNTIME`

## Neue Routen

- `GET /api/loyalty/games/settings`
- `POST /api/loyalty/games/settings`

## Ablauf

1. Apply-Script ausführen.
2. `stepdone.cmd` ausführen.
3. Backend neu starten.
4. Testscript ohne `-Execute` prüfen.
5. Testscript mit `-Execute` ausführen.

## Restore

Das Testscript stellt wieder her:

- Gamble-Settings
- `!gamble` Command-Status
- Testuser-Punktestand

Zusätzlich gibt es `SafetyDisable_STEP220_LWG6_1_gamble_ForrestCGN.ps1`.


## STEP220a / LWG-6.1a
Apply-Script Parserfehler korrigiert. Keine Runtime-Logik geaendert.


## STEP220C / LWG-6.1C

PowerShell-5 Parserfix fuer Gamble-Test/SafetyDisable: `??` entfernt, keine Runtime-Logikaenderung, vollstaendige Dateien im Paket.
