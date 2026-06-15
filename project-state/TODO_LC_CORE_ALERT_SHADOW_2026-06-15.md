# TODO – LC Core / Twitch Events / Alert Shadow

Stand: 2026-06-15

## Offen – Loyalty Core

- [ ] `loyalty.js` im neuen Chat read-only prüfen.
- [ ] Bonus-Mapping für alle Twitch-Support-Events kontrollieren.
- [ ] Punkteberechnung je Eventtyp prüfen.
- [ ] Dedupe-Verhalten bei Bus-Events prüfen.
- [ ] Prüfen, ob `gifted_sub_received` / `subgift` / `giftbomb` sauber getrennt werden.
- [ ] Prüfen, ob `mode: shadow` im Loyalty-Event-Kontext korrekt und gewollt ist.
- [ ] Entscheiden, ob zusätzliche Statusroute für letzte Bonus-Events nötig ist.

## Offen – Alert Shadow Monitoring

- [ ] Alert-Shadow über mehrere Streams beobachten.
- [ ] Follow im Alert-Shadow bestätigen.
- [ ] Raid im Alert-Shadow bestätigen.
- [ ] Sub im Alert-Shadow bestätigen.
- [ ] Resub im Alert-Shadow bestätigen.
- [ ] Subgift/Giftbomb im Alert-Shadow bestätigen.
- [ ] Cheer/Bits ist bereits bestätigt, weiter beobachten.

## Später – Alert Cleanup

- [ ] ALERT-TWITCH-1C planen: alter Alert-Direktpfad diagnostisch sichtbar und schaltbar machen.
- [ ] Doppelalert-Schutz prüfen.
- [ ] Bus-Produktivmodus nur kontrolliert freigeben.
- [ ] Alte direkte Alert-Route erst nach mehreren stabilen Streams entfernen/deaktivieren.

## Dauerregeln

- [ ] Keine produktive DB überschreiben.
- [ ] Keine Funktionalität entfernen.
- [ ] Keine Alert-Umschaltung ohne Live-Beobachtung.
- [ ] Keine parallelen Systeme bauen, vorhandenen Communication Bus nutzen.
