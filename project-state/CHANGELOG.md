# CHANGELOG – stream-control-center

## 2026-06-15 – Loyalty Go-Live / Punkteimport / Raffle

### Added

- `!raffle` und `!join` im bestehenden `loyalty_giveaways`-Modul.
- Raffle-Loyalty-Auszahlung mit internem 5000er Gewinnpool.
- Raffle-Transaktionen vom Typ `raffle_win`.
- Öffentliche Raffle-Textkeys `raffle.public.*`, um alte DB-Varianten mit Pool-Anzeige zu umgehen.
- StreamElements-Import-Tool und Importdateien für Top-489-Import.

### Changed

- Loyalty-Modus von `shadow` auf `live` gesetzt.
- Watch-Punkte produktiv aktiv.
- Event-Boni produktiv über `twitch_events` verarbeitet.
- Raffle-Chattexte bereinigt: Pool soll öffentlich nicht mehr angezeigt werden.

### Confirmed

- StreamElements-Import erfolgreich: 479 User / 1.832.557 Punkte.
- Twitch-Event-Boni: 22 received / 22 processed / 0 errors.
- Watch-Punkte gebucht.
- Raffle-Gewinne gebucht.
- Alerts weiterhin Shadow: enqueued = 0.

### Known Issues / Follow-up

- Raffle-Chattexte aus 1F im nächsten Stream prüfen.
- Subscriber-Tier-Erkennung prüfen.
- GiftSub-Receiver-Konfig/Buchung abgleichen.
