# loyalty_games.js / Gamble – STEP226 / LWG-6.7

Aktueller bestätigter Stand:

- Version: `0.2.5`
- Build: `STEP_LWG_6_5_GAMBLE_RESULT_LOG_CLEANUP`
- `!gamble` live aktiv nach STEP224A
- Prozent-Einsätze funktionieren, z. B. `!gamble 10%`
- Strukturierte Ergebnisdaten vorhanden:
  - `bet`
  - `outcome`
  - `won`
  - `grossPayout`
  - `winAmount`
  - `netProfit`
  - `balanceBefore`
  - `balanceAfter`
  - `availableBefore`
  - `availableAfter`
- Zufall: serverseitig über `crypto.randomInt`

## Dashboard-Vorbereitung

Spätere Konfigurationsfelder:

- Gamble aktiv
- Command aktiv
- User-Cooldown
- Globaler Cooldown
- Gewinnchance
- Auszahlungsmultiplikator
- Mindesteinsatz
- Maximaleinsatz
- Prozent-Einsätze erlaubt
- Keyword-Einsätze erlaubt
- Textvarianten / Text-Keys

## Sicherheitsregeln

- Änderungen nur mit Admin-/Owner-Recht.
- Änderungen müssen auditierbar sein.
- SafetyDisable muss erhalten bleiben.
- Keine bestehende Funktionalität entfernen.
