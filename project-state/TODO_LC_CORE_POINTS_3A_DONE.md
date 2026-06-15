# TODO – LC-CORE-POINTS-3A DONE

Stand: 2026-06-15

## Erledigt

- [x] `loyalty.js` auf Version 0.1.16 angehoben.
- [x] `twitchEventBonusBinding` in Loyalty-Status ergänzt.
- [x] Bus-Subscriber `loyalty:twitch.events:bonus_events` installiert.
- [x] Vorhandene Twitch-Eventnamen aus `twitch_events` konsumiert.
- [x] Mapping zu Loyalty-Eventtypen vorbereitet.
- [x] `recordEventBonus()` als zentrale Verarbeitung genutzt.
- [x] Alert-System bewusst nicht angefasst.

## Offen

- [ ] StepDone ausführen, falls noch nicht erledigt.
- [ ] Echten Live-Test mit Follow/Sub/Resub/Gift/Cheer/Raid durchführen.
- [ ] Prüfen, ob `received` und `processed` steigen.
- [ ] Prüfen, ob `errors` 0 bleibt.
- [ ] Prüfen, ob `loyaltyEvents`/Transaktionen korrekt steigen.
- [ ] Prüfen, ob ignored user `forrestcgn` weiterhin sauber ignoriert wird.
- [ ] Danach entscheiden, ob eine sichere Diagnose-/Smoke-Test-Route nötig ist.
- [ ] Später Alert-System separat anbinden.
