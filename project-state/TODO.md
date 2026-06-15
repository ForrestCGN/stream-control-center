# TODO – stream-control-center

Stand: 2026-06-15

## Erledigt

- Loyalty Core live geschaltet.
- StreamElements-Punkte additiv importiert.
- Watch-Punkte im Stream produktiv gebucht.
- Twitch-Event-Boni über `twitch_events` verarbeitet und gebucht.
- Alerts weiterhin Shadow gehalten.
- `!raffle` / `!join` im bestehenden `loyalty_giveaways` integriert.
- Raffle bucht Gewinnerpunkte als `raffle_win`.

## Offen

- Raffle-Chattexte aus STEP_LC_RAFFLE_1F sichtbar im Chat final prüfen.
- Raffle-Dashboard-Config planen und später bauen.
- Subscriber-Tier-Erkennung prüfen.
- GiftSub-Receiver-Konfig/Buchung abgleichen.
- Alert-Twitch-Events weiter im Shadow-Modus beobachten.
- Status-Warning in `loyalty_giveaways` bei Gelegenheit von 1D auf 1F aktualisieren.

## Nicht tun ohne explizite Freigabe

- Alerts produktiv auf Twitch-Events/Bus umschalten.
- Produktive DB ersetzen oder überschreiben.
- Raffle als neues Parallelmodul bauen.
- Bestehende Giveaway-/Wheel-Logik umbauen.
