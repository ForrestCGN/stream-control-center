# CHANGELOG – stream-control-center

## 2026-06-15 – Loyalty Go-Live / Punkteimport / Raffle / Mini-Spiele

### Added

- `!raffle` und `!join` im bestehenden `loyalty_giveaways`-Modul.
- Raffle-Loyalty-Auszahlung mit internem 5000er Gewinnpool.
- Raffle-Transaktionen vom Typ `raffle_win`.
- Öffentliche Raffle-Textkeys `raffle.public.*`.
- StreamElements-Import-Tool und Importdateien für Top-489-Import.
- Raffle-API-Routen:
  - `GET /api/loyalty/raffle/status`
  - `GET /api/loyalty/raffle/config`
  - `POST /api/loyalty/raffle/config`
- Dashboard-Tab `Mini-Spiele`.
- Raffle-Bereich im Mini-Spiele-Dashboard.
- Gamble-Bereich im Mini-Spiele-Dashboard.

### Changed

- Loyalty-Modus von `shadow` auf `live` gesetzt.
- Watch-Punkte produktiv aktiv.
- Event-Boni produktiv über `twitch_events` verarbeitet.
- Raffle-Chattexte bereinigt: Pool wird öffentlich nicht mehr angezeigt.
- Loyalty-Navigation: `Gamble` als Haupttab wurde durch `Mini-Spiele` ersetzt.
- Raffle-Dashboard-Begriff `Gewinnpool intern` wurde in `Raffle-Gewinn gesamt` verbessert.
- Mini-Spiele Dashboard-Layout bereinigt.

### Fixed

- Raffle Config Endpoint: `CHAT_TEXT_VARIANTS is not defined` korrigiert.
- Dashboard-Live-Pfad-Problem erkannt: Repo-ZIPs mit `dashboard/modules` landen nicht automatisch in `htdocs/dashboard/modules`, wenn direkt nach `D:\Streaming\stramAssets` entpackt wird.
- FULLPATH-ZIPs für direkten Live-Deploy erstellt.
- Raffle-Gewinnerregel und Textkeys im Dashboard gegen zusammenklebende Darstellung bereinigt.

### Confirmed

- StreamElements-Import erfolgreich: 479 User / 1.832.557 Punkte.
- Twitch-Event-Boni produktiv verarbeitet.
- Watch-Punkte gebucht.
- Raffle-Gewinne gebucht.
- Raffle-Config lädt und speichert.
- `showPoolInChat=false` bleibt nach Dashboard-Speichern erhalten.
- Alerts weiterhin Shadow.

### Known Issues / Follow-up

- Config und Texte strukturell aus Mini-Spiele heraus sauber nach Einstellungen/Texte verschieben.
- Subscriber-Tier-Erkennung prüfen.
- GiftSub-Receiver-Konfig/Buchung abgleichen.
- Alert-Shadow weiter über mehrere Streams beobachten.
