# TODO – stream-control-center

Stand: 2026-06-16

## Erledigt / bestätigt

- [x] LC-CORE-LIVE-1.1 Loyalty nutzt `/api/twitch/events/stream-state` als effektive Live-Wahrheit.
- [x] LC-CORE-CLEANUP-1 alte direkte Twitch-Live-Abfrage aus Loyalty entfernt.
- [x] LC-CORE-POINTS-1 bis LC-CORE-POINTS-2C bestätigt.
- [x] Twitch Presence / aktive User für Watch-Punkte bestätigt.
- [x] Loyalty Core live geschaltet.
- [x] StreamElements-Punkteimport durchgeführt.
- [x] Raffle produktiv als Mini-Spiel im bestehenden Modul `loyalty_giveaways.js` vorbereitet.
- [x] Dashboard-Tab `Mini-Spiele` für Raffle/Gamble aufgebaut.
- [x] Raffle-Config aus Mini-Spiele herausgezogen und unter `Loyalty -> Einstellungen -> Raffle` eingeordnet.
- [x] Raffle-Texte unter `Loyalty -> Texte -> Raffle` filterbar gemacht.
- [x] Texte-Dropdown zeigt keine globale Option `Alle Textbereiche` mehr.
- [x] Textvarianten-Tabelle zeigt nur noch den ausgewählten Bereich.
- [x] Raffle-Command-Felder aus Raffle-Config entfernt; Commands gehören langfristig ins Command-Modul.
- [x] Raffle-Teilnahmekosten backendseitig eingebaut.
- [x] Raffle-Config speichert `entryCostAmount=10` und `entryCostEnabled=true` korrekt.
- [x] Alte aktive mehrzeilige Text-Sammelvarianten in `chat_raffle`, `chat_giveaway`, `chat_ticket`, `chat_wheel` bereinigt.
- [x] Prüfung auf aktive mehrzeilige Textvarianten in `/api/loyalty/giveaways/texts` liefert keine Ausgabe.

## Aktuell offen / als nächstes testen

- [ ] Raffle-Teilnahmekosten live testen:
  - [ ] `entryCostAmount=0` -> kostenloser Join.
  - [ ] `entryCostAmount>0` und genug Punkte -> Punkteabzug + Teilnahme.
  - [ ] `entryCostAmount>0` und zu wenig Punkte -> keine Teilnahme + Text über `helper_texts`.
  - [ ] Doppeltes `!join` -> keine zweite Abbuchung.
  - [ ] Raffle Cancel -> bezahlte Teilnahmen werden erstattet.
  - [ ] Normaler Raffle-Abschluss -> keine Erstattung, Gewinner erhalten Auszahlung.
- [ ] Nach Kosten-Live-Test Transaktionen/Balances gegenprüfen.
- [ ] Nach Kosten-Live-Test Raffle-Texte im Dashboard prüfen und ggf. Varianten kürzen/ergänzen.

## Wichtige spätere Korrektur / Prüfung

- [ ] StreamElements-Import prüfen: Beim Import wurden die bereits im neuen Loyalty-System gesammelten Punkte nicht addiert. Für spätere Korrektur/Abgleich berücksichtigen.

## Nächster Hauptblock danach

- [ ] LC-CORE-POINTS-3A weiterführen: Twitch Events als abonnierbare Bonus-Events vorbereiten.
- [ ] Vor Umsetzung echte Dateien aus GitHub/dev prüfen:
  - [ ] `backend/modules/twitch_events.js`
  - [ ] `backend/modules/loyalty.js`
  - [ ] `backend/modules/communication_bus.js`
  - [ ] `backend/modules/helpers/helper_communication.js`
  - [ ] relevante Dokus in `docs/current/*`
- [ ] EventKeys/Payload für Bonus-relevante Twitch Events finalisieren.
- [ ] Loyalty-Bus-Subscriber für EventBonus-Events planen/umsetzen.
- [ ] Alerts weiterhin Shadow beobachten, keine Produktivumschaltung ohne Freigabe.

## Nicht wieder einführen

- [ ] `/api/stream-status/status?forceApi=1` als effektive Live-Wahrheit für Module.
- [ ] Direkte Twitch-Live-Abfrage innerhalb von Loyalty.
- [ ] Lokale Loyalty-Start/Stop-Routen als Stream-Wahrheit.
- [ ] Raffle-Command-Konfiguration direkt in `Einstellungen -> Raffle`.
- [ ] Alte `raffle.*` Chatkeys als produktiven Raffle-Pfad.
- [ ] Mehrzeilige Sammelvarianten als aktive Textvarianten.
- [ ] Produktive SQLite ersetzen/neu bauen.
