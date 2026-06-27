# STEP LC-RAFFLE-1F – Raffle Public Textkeys / Gewinnerbetrag sichtbar

Stand: 2026-06-15

## Ziel

Die öffentlichen Raffle-Chatmeldungen nutzen ab diesem Step neue Textkeys `raffle.public.*`.
Damit werden alte bereits in der DB vorhandene Varianten nicht weiter zufällig gezogen.

## Grund

Vorher konnten alte Textvarianten aus der DB weiterhin erscheinen, z. B.:

- Startmeldung mit Pool-Anzeige
- Gewinnertext ohne Gewinnbetrag

## Änderung

- `MODULE_VERSION = 0.1.7`
- `MODULE_BUILD = STEP_LC_RAFFLE_1F`
- Neue öffentliche Textkeys:
  - `raffle.public.started`
  - `raffle.public.already_active`
  - `raffle.public.joined`
  - `raffle.public.already_joined`
  - `raffle.public.no_active`
  - `raffle.public.status`
  - `raffle.public.cancelled`
  - `raffle.public.no_entries`
  - `raffle.public.winners`
  - `raffle.public.permission_denied`
- Gewinnertexte nennen jetzt Gewinner und Betrag pro Gewinner.
- Starttexte zeigen keinen Pool mehr.

## Nicht geändert

- Keine Änderung an der Raffle-Logik.
- Keine Änderung an der Punktebuchung.
- Keine Änderung am internen 5000er Gewinnpool.
- Keine Änderung an der Gewinnerregel.
- Kein Dashboard.
- Kein neues Modul.

## Test

```powershell
node -c .\backend\modules\loyalty_giveaways.js
```

Danach Chat-Test:

```text
!raffle
!join
```

Erwartung:

- Startmeldung enthält keinen Pool.
- Gewinnernachricht enthält Gewinnerliste und Gewinnbetrag pro Gewinner.
- `raffle_win` Transaktionen werden weiterhin gebucht.
