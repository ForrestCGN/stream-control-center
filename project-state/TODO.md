# TODO

## CAN-25

- [x] CAN-25.0 Entscheidung: Dashboard/Bus-Diagnose fuer Sound-Shadow verbessern.
- [x] CAN-25.1 vorhandene Dashboard-/Bus-Diagnose-Daten inspizieren.
- [x] CAN-25.2 Dashboard Sound-Shadow Summary Card read-only ergaenzen.
- [x] CAN-25.3 lokalen Dashboard-/Backend-Check vorbereiten und auswerten.
- [x] CAN-25.4 Dokumentation/TODO/Handoff fuer neuen Chat aktualisieren.
- [ ] CAN-25.5 Sound-Shadow Summary Card an echte Bus-Matrix-Row-Struktur anpassen.
- [ ] CAN-25.6 Dashboard-Check nach Fix dokumentieren.
- [ ] Danach entscheiden: UI-Cleanup oder naechster technischer Kandidat.

## Bekannter Bug

- [ ] `pickSoundShadowStatus(matrix)` liest aktuell nicht aus `matrix.rows[id="channelpoints"]`.
- [ ] Sound-Shadow Summary Card zeigt deshalb `keine Daten`, obwohl Daten vorhanden sind.

## Separates spaeteres Layout-Thema

- [ ] Systeme-Tabelle in Bus-Matrix kompakter/lesbarer machen.
- [ ] Diese Layout-Arbeit nicht mit CAN-25.5 vermischen.

## Weiterhin hart blockiert

- [ ] Keine produktive Sound-Migration ohne eigenen kleinen Go-Schritt.
- [ ] Kein produktiver Sound-Bus-Play.
- [ ] Kein Queue-Clear.
- [ ] Keine Twitch-/Redemption-Write-Aktion durch Shadow.
- [ ] Kein automatischer Shadow-Mitulauf fuer alle Rewards.
- [ ] Kein EventSub-/Twitch-Redemption-Test ohne separate Freigabe.
- [ ] Keine Enable/Test/Migration-Buttons in der Sound-Shadow Card.
